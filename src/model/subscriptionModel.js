import mongoose ,{ Schema }from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    Subscription :{
        type: Schema.Types.ObjectId,
       ref:"User",
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

export const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);
