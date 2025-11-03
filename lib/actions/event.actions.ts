'use server';

import Event from '@/database/event.model';
import connectDB from "@/lib/mongodb";
import type { IEvent } from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });
        return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean<IEvent[]>();
    } catch {
        return [];
    }
}