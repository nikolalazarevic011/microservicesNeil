"use server";

import { auth } from "@/auth";
import { Auction, PagedResult } from "@/types";

export async function getData(query: string): Promise<PagedResult<Auction>> {
    const res = await fetch(`http://localhost:6002/search${query}`); //gotta use 6002 since my gateway is there, udemy guy has it on 6001

    if (!res.ok) throw new Error("Failed to fetch data");

    return res.json();
}

export async function updateAuctionTest() {
    const data = {
        mileage: Math.floor(Math.random() * 10000) + 1,
    };

    const session = await auth();

    const res = await fetch(
        "http://localhost:6002/auctions/afbee524-5972-4075-8800-7d1f9d7b0a0c",
        {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
                "Authorization": "Bearer " + session?.accessToken,
            },
            body: JSON.stringify(data),
        }
    );

    if (!res.ok) return { status: res.status, message: res.statusText };

    return res.statusText;
}
