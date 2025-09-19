"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { posterCategories } from "../[club]/client";
import { PosterChip } from "@/components/PosterChip";

export default function AddPosterPage() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [posterType, setPosterType] = useState<"Club" | "Event">("Club");
  const processing = useRef(false);
  const [selectedCategory, setSelectedCategory] = useState<boolean[]>(
    Array(posterCategories.length).fill(false)
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an image file
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
        alert("Please select an image file");
      }
    } else {
      setPreviewUrl(null);
    }
  };

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (processing.current) {
      return; // Prevent multiple submissions
    }
    processing.current = true;
    setToast("Processing...");

    const formData = new FormData(event.currentTarget);
    const clubName = formData.get("clubName") as string;
    const posterFile = formData.get("posterFile") as File;
    const description = formData.get("description") as string;
    const eventDateTime = formData.get("eventDateTime") as string;

    console.log({
      clubName,
      posterFile,
      description,
      eventDateTime,
    });

    // Check required fields
    if (!clubName || !posterFile || !description) {
      setToast("Please fill in all required fields.");
      return;
    }

    // Send data to the API
    try {
      const payload = new FormData();
      payload.append("name", clubName);
      payload.append("posterFile", posterFile);
      payload.append("description", description);
      if (eventDateTime) {
        payload.append("eventDateTime", eventDateTime);
      }
      payload.append("posterType", posterType);
      payload.append(
        "categories",
        selectedCategory
          .map((selected, index) => (selected ? posterCategories[index] : null))
          .filter((category) => category)
          .join(",")
      );

      const response = await fetch("/api/posters/add", {
        method: "POST",
        body: payload, // Don't set Content-Type header, let browser set it automatically for FormData
      });

      if (response.ok) {
        setToast(null);
        router.push("/poster-board");
      } else {
        setToast(response.statusText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setToast("Failed to submit form.");
    }
    processing.current = false;
  }

  // Function to handle clicks on the chips
  function handleChipClick(category: string) {
    setSelectedCategory((prevSelected) => {
      const index = posterCategories.indexOf(category);
      const newSelected = [...prevSelected];
      newSelected[index] = !newSelected[index];

      return newSelected;
    });
  }

  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <form
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md"
        onSubmit={submitForm}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Add a Poster</h1>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="clubName"
          >
            {posterType} Name
            <span className="text-red-500">*</span>
          </label>
          <div className="flex row">
            <select
              className="shadow border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
              onChange={(e) => {
                setPosterType(e.currentTarget.value as "Club" | "Event");
              }}
            >
              <option value="Club">Club</option>
              <option value="Event">Event</option>
            </select>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name="clubName"
              type="text"
              placeholder={`Enter ${posterType} name`}
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="posterFile"
          >
            Poster File<span className="text-red-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="posterFile"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            placeholder="Upload poster image"
          />
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img
                src={previewUrl}
                alt="Poster preview"
                className="max-w-full h-48 object-contain border rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description<span className="text-red-500">*</span>
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="description"
            rows={4}
            placeholder="Enter poster description"
          ></textarea>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="eventDateTime"
          >
            Date & Time of Event (Not Mandatory)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="eventDateTime"
            type="datetime-local"
            placeholder="Select Date & Time of Event"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Categories
          </label>
          <div className="flex flex-wrap">
            {posterCategories.map((category, index) => (
              <PosterChip
                key={category}
                category={category}
                onClick={handleChipClick}
                enabled={selectedCategory[index]}
              />
            ))}
          </div>
        </div>

        {toast && (
          <div className="mt-4 mb-4">
            <p className="text-sm text-red-600">{toast}</p>
          </div>
        )}

        <div className="flex items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit Poster
          </button>
        </div>
      </form>
    </div>
  );
}
