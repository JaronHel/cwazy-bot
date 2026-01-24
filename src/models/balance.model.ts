import mongoose from "mongoose";

export interface IBalance {
  discordID: string;
  balance: number;
}

const balanceSchema = new mongoose.Schema<IBalance>(
  {
    discordID: {
      type: String,
      required: [true, "DiscordID is required"],
    },
    balance: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true },
);

export const Balance = mongoose.model<IBalance>("balance", balanceSchema);
