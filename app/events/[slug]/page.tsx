import {notFound} from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { IEvent } from "@/database/event.model";
import {getSimilarEventsBySlug} from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import {cacheLife} from "next/cache";

const BASE_URL=process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsItem = ({ icon, alt, label }: { icon: string; alt: string; label: string; }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
)

const EventDetailsPage = async ({params}: { params: { slug: string } }) => {
   'use cache'
    cacheLife('hours');
    const {slug} = await params;

    try {
        const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
            cache: 'no-store' // للتأكد من الحصول على أحدث البيانات
        });

        if (!request.ok) return notFound();

        const data = await request.json();
        const {event} = data;

        if (!event || !event.description) return notFound();

        const {
            title,
            image,
            overview,
            mode,
            location,
            date,
            time,
            description,
            agenda,
            organizer,
            audience,
            tags
        } = event;

        const bookings=10;

        const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
console.log(similarEvents)
        return (
            <section id="event">
                <div className="header">
                    <h1>Event Description</h1>
                    <p>{description}</p>
                </div>

                <div className="details">
                    <div className="content">
                        <Image src={image} alt={title} width={800} height={800} className="banner" />

                        <section>
                            <h2>Overview</h2>
                            <p>{overview}</p>
                        </section>

                        <section>
                            <h2>Details</h2>
                            <ul className="flex flex-col gap-2">
                                <EventDetailsItem icon="/icons/calendar.svg" alt="date" label={date} />
                                <EventDetailsItem icon="/icons/clock.svg" alt="time" label={time} />
                                <EventDetailsItem icon="/icons/pin.svg" alt="location" label={location} />
                                <EventDetailsItem icon="/icons/audience.svg" alt="audience" label={audience} />
                                <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
                            </ul>
                        </section>

                        {Array.isArray(agenda) && <EventAgenda agendaItems={agenda} />}

                        <section className="flex flex-col gap-4">
                            <h2 className="text-2xl font-bold">About the Organizer</h2>
                            <p>{organizer}</p>
                        </section>

                        {Array.isArray(tags) && <EventTags tags={tags} />}

                    </div>

                    {/*    Right Side - Booking Form */}
                    <aside className="booking">
                        <div className="signup-card">
                            <h2>Book Your Spot</h2>
                            {bookings > 0 ? (
                                <p className="text-sm">
                                    Join {bookings} people who have already booked their spot!
                                </p>
                            ): (
                                <p className="text-sm">Be the first to book your spot!</p>
                            )}

                            <BookEvent eventId={event._id} slug={event.slug} />
                        </div>
                    </aside>
                </div>


                <div className="flex w-full flex-col gap-4 pt-20">
                    <h2>Similar Events</h2>
                    <div className="events">
                        {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
                            <EventCard key={similarEvent.title} {...similarEvent} />
                        ))}
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error fetching event:', error);
        return notFound();
    }
}

export default EventDetailsPage