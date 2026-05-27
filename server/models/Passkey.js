const mongoose = require("mongoose");

const passkeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The credential ID returned by simplewebauthn (in base64url format)
    credentialID: {
      type: String,
      required: true,
      unique: true,
    },
    // The public key bytes (stored as a Buffer)
    credentialPublicKey: {
      type: Buffer,
      required: true,
    },
    // Signature counter to verify credential cloning
    counter: {
      type: Number,
      required: true,
      default: 0,
    },
    // Allowed transports (e.g. usb, ble, nfc, internal)
    transports: {
      type: [String],
      default: [],
    },
    // Friendly device label (e.g. "My MacBook", "YubiKey")
    deviceType: {
      type: String,
      default: "Unknown Device",
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster lookups
passkeySchema.index({ userId: 1 });
passkeySchema.index({ credentialID: 1 });

const Passkey = mongoose.model("Passkey", passkeySchema);

module.exports = Passkey;
