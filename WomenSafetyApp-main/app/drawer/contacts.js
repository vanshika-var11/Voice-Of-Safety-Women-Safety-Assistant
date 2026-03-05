import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet 
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "", relation: "" });

  // Load contacts
  const loadContacts = async () => {
    setLoading(true);
    try {
      const userResp = await supabase.auth.getUser();
      const userId = userResp.data.user?.id;
      if (!userId) throw new Error("No logged-in user");

      const { data, error } = await supabase
        .from("trusted_contacts")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // Add contact
  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert("Validation", "Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      const userResp = await supabase.auth.getUser();
      const userId = userResp.data.user?.id;

      const { error } = await supabase.from("trusted_contacts").insert([
        { ...newContact, user_id: userId },
      ]);
      if (error) throw error;

      setNewContact({ name: "", phone: "", email: "", relation: "" });
      setShowAddForm(false);
      loadContacts();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update contact
  const updateContact = async (contact) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("trusted_contacts")
        .update({
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          relation: contact.relation,
        })
        .eq("id", contact.id);
      if (error) throw error;

      setEditingContact(null);
      loadContacts();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete contact
  const deleteContact = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.from("trusted_contacts").delete().eq("id", id);
            if (error) throw error;
            loadContacts();
          } catch (err) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  // Quick actions
  const handleCall = (phone) => {
    window?.open(`tel:${phone}`);
  };
  const handleMessage = (phone) => {
    window?.open(`sms:${phone}`);
  };
  const handleEmail = (email) => {
    if (email) window?.open(`mailto:${email}`);
  };

  const renderContact = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      {item.relation && <Text style={styles.relation}>{item.relation}</Text>}
      <Text style={styles.info}>+91-{item.phone}</Text>
      {item.email && <Text style={styles.info}>📧 {item.email}</Text>}

      {/* Quick actions */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.call]} onPress={() => handleCall(item.phone)}>
          <Text style={styles.buttonText}>📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.sms]} onPress={() => handleMessage(item.phone)}>
          <Text style={styles.buttonText}>💬 SMS</Text>
        </TouchableOpacity>
        {item.email && (
          <TouchableOpacity style={[styles.button, styles.email]} onPress={() => handleEmail(item.email)}>
            <Text style={styles.buttonText}>📧 Email</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Edit/Delete */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.edit]} onPress={() => setEditingContact(item)}>
          <Text style={styles.buttonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.delete]} onPress={() => deleteContact(item.id)}>
          <Text style={styles.buttonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7b4fff" />
      </View>
    );

return (
  <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
>
  <View style={{ flex: 1, padding: 16 }}>
    {/* Header */}
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
    <Text style={styles.title}>Trusted Contacts</Text>
    {!showAddForm && (  // only show +Add if the form is not open
      <TouchableOpacity style={[styles.addSmall]} onPress={() => setShowAddForm(true)}>
        <Text style={styles.buttonText}>+ Add</Text>
      </TouchableOpacity>
    )}
    </View>


    {/* FlatList */}
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderContact}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 150 }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          {/* Add Contact Form */}
          {showAddForm && (
            <View style={styles.card}>
              <TextInput
                placeholder="Full Name *"
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Phone *"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Email"
                value={newContact.email}
                onChangeText={(text) => setNewContact({ ...newContact, email: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Relationship"
                value={newContact.relation}
                onChangeText={(text) => setNewContact({ ...newContact, relation: text })}
                style={styles.input}
              />
              <View style={styles.row}>
                <TouchableOpacity style={[styles.button, styles.add]} onPress={addContact} disabled={saving}>
                  <Text style={styles.buttonText}>{saving ? "Adding..." : "Add Contact"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => setShowAddForm(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Edit Form */}
          {editingContact && (
            <View style={styles.card}>
              <TextInput
                placeholder="Full Name"
                value={editingContact.name}
                onChangeText={(text) => setEditingContact({ ...editingContact, name: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Phone"
                value={editingContact.phone}
                onChangeText={(text) => setEditingContact({ ...editingContact, phone: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Email"
                value={editingContact.email}
                onChangeText={(text) => setEditingContact({ ...editingContact, email: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Relationship"
                value={editingContact.relation}
                onChangeText={(text) => setEditingContact({ ...editingContact, relation: text })}
                style={styles.input}
              />
              <View style={styles.row}>
                <TouchableOpacity style={[styles.button, styles.add]} onPress={() => updateContact(editingContact)} disabled={saving}>
                  <Text style={styles.buttonText}>{saving ? "Updating..." : "Update"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => setEditingContact(null)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>No contacts yet.</Text>
        </View>
      }
    />
  </View>
</KeyboardAvoidingView>
);
}    

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  relation: { color: "#666", marginBottom: 4 },
  info: { color: "#444", fontFamily: "monospace", marginBottom: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6, marginBottom: 8, backgroundColor: "#fff" },
  button: { flex: 1, padding: 10, borderRadius: 6, alignItems: "center", marginHorizontal: 4 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  call: { backgroundColor: "#28a745" },
  sms: { backgroundColor: "#007bff" },
  email: { backgroundColor: "#6f42c1" },
  edit: { backgroundColor: "#ffc107" },
  delete: { backgroundColor: "#dc3545" },
  add: { backgroundColor: "#7b4fff" },
  cancel: { backgroundColor: "#6c757d" },
  addSmall: {
    backgroundColor: "#7b4fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  } 
});
