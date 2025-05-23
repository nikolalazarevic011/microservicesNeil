"use server";
import { Auction, PagedResult } from "@/types";

export async function getData(query: string): Promise<PagedResult<Auction>> {
    const res = await fetch(`http://localhost:6002/search?${query}`); //gotta use 6002 since my gateway is there, udemy guy has it on 6001

    if (!res.ok) throw new Error("Failed to fetch data");

    return res.json();
}
