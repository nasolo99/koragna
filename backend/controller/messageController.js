import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // // Sauvegarde une par une
    // await conversation.save();
    // await newMessage.save();

    // Sauvegarde en parallèle
    await Promise.all([conversation.save(), newMessage.save()]);

    res.status(201).json({ newMessage });
  } catch (error) {
    console.log("Erreur lors de l'envoi du message : ", error.message);
    res.status(500).json({ error: "Erreur du serveur interne" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChat } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChat] },
    }).populate("messages");

    if (!conversation) return res.status(201).json([]);

    res.status(201).json(conversation.messages);
  } catch (error) {
    console.log("Erreur lors de la reception du message : ", error.message);
    res.status(500).json({ error: "Erreur du serveur interne" });
  }
};
