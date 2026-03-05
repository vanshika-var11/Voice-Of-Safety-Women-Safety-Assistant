import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";


export default function SafetyTips() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI Safety Assistant. I'm here to help you with safety advice and guidance. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    "What to do if I feel unsafe?",
    "How to stay safe while walking alone?",
    "What should I do in an emergency?",
    "How to protect myself online?",
    "Tips for safe travel",
  ];

  const safetyTips = [
    {
      category: "Walking Alone",
      tips: [
        "Stay in well-lit areas",
        "Walk confidently and be aware of your surroundings",
        "Keep your phone accessible but not visible",
        "Trust your instincts - if something feels wrong, change your route",
      ],
    },
    {
      category: "Public Transportation",
      tips: [
        "Sit near the driver or conductor",
        "Stay alert and avoid falling asleep",
        "Keep your belongings close to you",
        "Have emergency contacts on speed dial",
      ],
    },
    {
      category: "Online Safety",
      tips: [
        "Never share personal information with strangers",
        "Use strong, unique passwords",
        "Enable two-factor authentication",
        "Be cautious of suspicious links and requests",
      ],
    },
  ];

  // ✅ AI CALL
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("https://unnotified-mellie-disjunctively.ngrok-free.dev/ai-chat", {
        method: "POST",
        headers: {  
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: data.reply || "Sorry, I couldn't respond.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("AI error:", error);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "⚠️ Unable to reach AI server.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }

    setIsTyping(false);
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>AI Safety Assistant</Text>
      <Text style={styles.subHeader}>
        Get instant safety advice and guidance
      </Text>

      {/* Chat */}
      <View style={styles.chatContainer}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.message,
              msg.type === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={msg.type === "user" ? styles.userText : styles.botText}>
              {msg.content}
            </Text>
            <Text style={styles.timestamp}>
              {msg.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.message, styles.botMessage]}>
            <Text style={styles.botText}>Typing...</Text>
          </View>
        )}
      </View>

      {/* Quick Questions */}
      <View style={styles.quickQuestions}>
        {quickQuestions.map((q, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleQuickQuestion(q)}
            style={styles.quickBtn}
          >
            <Text style={styles.quickBtnText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about safety..."
          value={inputMessage}
          onChangeText={setInputMessage}
          onSubmitEditing={() => sendMessage(inputMessage)}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => sendMessage(inputMessage)}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Tips */}
      <View style={styles.safetyTipsContainer}>
        <Text style={styles.subHeader}>Safety Tips</Text>
        {safetyTips.map((cat, idx) => (
          <View key={idx} style={styles.category}>
            <Text style={styles.categoryTitle}>{cat.category}</Text>
            {cat.tips.map((tip, tIdx) => (
              <Text key={tIdx} style={styles.tip}>• {tip}</Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },

  subHeader: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },

  chatContainer: {
    marginBottom: 16,
  },

  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: "85%",
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6A0DAD",
  },

  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
  },

  userText: {
    color: "#fff",
  },

  botText: {
    color: "#111827",
  },

  timestamp: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },

  quickQuestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  quickBtn: {
    backgroundColor: "#6A0DAD",
    padding: 8,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  quickBtnText: {
    fontSize: 12,
    color: "#fff",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#6A0DAD",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  safetyTipsContainer: {
    marginBottom: 40,
  },

  category: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  categoryTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827",
  },

  tip: {
    color: "#4b5563",
    marginBottom: 2,
  },
});