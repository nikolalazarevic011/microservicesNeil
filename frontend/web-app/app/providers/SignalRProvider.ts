"use client";

import { useAuctionStore } from "@/hooks/useAuctionStore";
import { useBidStore } from "@/hooks/useBidStore";
import { Auction, Bid } from "@/types";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { User } from "next-auth";
import { useParams } from "next/navigation";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { set } from "react-hook-form";
import toast from "react-hot-toast";
import { getDetailedViewData } from "../actions/auctionActions";
// import AuctionFinishedToast from "../components/AuctionFinishedToast";
import AuctionCreatedToast from "@/app/components/AuctionCreatedToast";

type Props = {
    children: ReactNode;
    user: User | null;
};

export default function SignalRProvider({ children, user }: Props) {
    const connection = useRef<HubConnection | null>(null);
    const setCurrentPrice = useAuctionStore((state) => state.setCurrentPrice);
    const addBid = useBidStore((state) => state.addBid);
    const params = useParams<{ id: string }>();

    // const handleAuctionFinished = useCallback((finishedAuction: AuctionFinished) => {
    //     const auction = getDetailedViewData(finishedAuction.auctionId);
    //     return toast.promise(auction, {
    //         loading: 'Loading',
    //         success: (auction) => <AuctionFinishedToast
    //             finishedAuction={finishedAuction}
    //             auction={auction} />,
    //         error: () => 'Auction finished'
    //     }, {success: {duration: 10000, icon: null}})
    // }, [])

    const handleAuctionCreated = useCallback((auctionData: Auction) => {
    if ((user as any)?.username !== auctionData.seller) {
        const toastElement = <AuctionCreatedToast auction={auctionData} />;
        return toast(toastElement, {
            duration: 10000,
        })
    }
}, [user])

    const handleBidPlaced = useCallback(
        (bid: Bid) => {
            if (bid.bidStatus.includes("Accepted")) {
                setCurrentPrice(bid.auctionId, bid.amount);
            }

            if (params.id === bid.auctionId) {
                addBid(bid);
            }
        },
        [setCurrentPrice, addBid, params.id]
    );

    useEffect(() => {
        if (!connection.current) {
            connection.current = new HubConnectionBuilder()
                .withUrl("http://localhost:6002/notifications") //our gateway is running on port 6002?
                .withAutomaticReconnect()
                .build();

            connection.current
                .start()
                .then(() => console.log("Connected to notification hub"))
                .catch((err) =>
                    console.error("Error connecting to SignalR hub:", err)
                );
        }

        connection.current.on("BidPlaced", handleBidPlaced);
        connection.current.on("AuctionCreated", handleAuctionCreated);
        // connection.current.on('AuctionFinished', handleAuctionFinished);

        return () => {
            connection.current?.off("BidPlaced", handleBidPlaced);
            connection.current?.off("AuctionCreated", handleAuctionCreated);
            // connection.current?.off('AuctionFinished', handleAuctionFinished);
        };

        // }, [handleBidPlaced, handleAuctionCreated, handleAuctionFinished]);
    }, [setCurrentPrice, handleBidPlaced, handleAuctionCreated]);

    return children;
}
