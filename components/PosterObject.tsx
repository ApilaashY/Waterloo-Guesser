import { type PosterObject } from "@/app/poster-board/page";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function PosterObject({
  router,
  clubName,
  posterUrl,
  description,
  eventDateTime,
}: PosterObject & { router: AppRouterInstance }) {
  const addToCalendar = (
    eventDate: Date,
    title: string,
    description: string
  ) => {
    // Create calendar event details
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

    // Format dates for calendar URL (YYYYMMDDTHHMMSSZ)
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const startDateFormatted = formatDateForCalendar(startDate);
    const endDateFormatted = formatDateForCalendar(endDate);

    // Try to detect device and provide appropriate calendar link
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = userAgent.includes("iphone") || userAgent.includes("ipad");
    const isSafari =
      userAgent.includes("safari") && !userAgent.includes("chrome");

    if (isIOS) {
      // For iOS, create a more compatible ICS content
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//University of Waterloo//Poster Board//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `DTSTART:${startDateFormatted}`,
        `DTEND:${endDateFormatted}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
        "LOCATION:University of Waterloo",
        `URL:${window.location.href}`,
        `UID:${Date.now()}@uwguesser.com`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      // Create blob and download for iOS
      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      // Also try to open in calendar app as fallback
      setTimeout(() => {
        const calendarUrl = `calshow:${startDate.getTime()}`;
        window.location.href = calendarUrl;
      }, 500);
    } else {
      // For non-iOS devices, use Google Calendar
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title
      )}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(
        description
      )}&location=${encodeURIComponent("University of Waterloo")}`;

      window.open(googleCalendarUrl, "_blank");
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md m-4">
      <img
        src={posterUrl}
        alt={`${clubName} poster`}
        className="w-full object-cover"
      />
      <div className="p-4">
        <h2
          className="text-xl font-bold cursor-pointer hover:underline"
          onClick={() => router.push(`/poster-board/${clubName}`)}
        >
          {clubName}
        </h2>
        <p className="text-gray-600">{description}</p>
        {eventDateTime && (
          <p
            className="text-blue-600 cursor-pointer hover:underline flex items-center gap-1"
            onClick={() =>
              addToCalendar(
                new Date(eventDateTime),
                `${clubName} Event`,
                description
              )
            }
            title="Click to add to calendar"
          >
            {new Date(eventDateTime).toLocaleDateString()} at{" "}
            {new Date(eventDateTime).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
