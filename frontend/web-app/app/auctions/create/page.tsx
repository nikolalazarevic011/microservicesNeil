import Heading from "@/app/components/Heading";
import React from "react";
import AuctionForm from "../AuctionForm";

export default function Create() {
    return (
        <div className="mx-auto max-w-[75%] shadow-lg p-10 bg rounded-lg">
            <Heading
                title="Sell your car"
                subtitle="Enter the details of your car"
            />
            <AuctionForm />
        </div>
    );
}
