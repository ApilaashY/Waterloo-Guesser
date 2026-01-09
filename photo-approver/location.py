import pymongo
from dotenv import find_dotenv, load_dotenv, dotenv_values
import cv2
import numpy as np
import requests
import certifi

load_dotenv(find_dotenv("../.env"))

print(dotenv_values()["MONGODB_URI"])

client = pymongo.MongoClient(
    dotenv_values()["MONGODB_URI"],
    tlsCAFile=certifi.where()
)

collection = client.get_database("UWguesser").get_collection("base_locations")

def display_campus_map_with_marker_opencv(x_percent, y_percent, campus_map_path="uw campus map.png"):
    """
    Display the UW campus map with a marker at the specified percentage coordinates using OpenCV.
    
    Args:
        x_percent: X coordinate as a percentage (0-100)
        y_percent: Y coordinate as a percentage (0-100) 
        campus_map_path: Path to the campus map image
    """
    # Load the campus map
    campus_map = cv2.imread(campus_map_path)
    if campus_map is None:
        print(f"Could not load campus map from {campus_map_path}")
        return
    
    # Get map dimensions
    map_height, map_width = campus_map.shape[:2]

    print(f"Map dimensions: width={map_width}, height={map_height}")
    
    # Convert percentages to pixel coordinates
    x_pixel = int((x_percent) * map_width)
    y_pixel = int((y_percent) * map_height)
    
    # Create a copy to draw on
    map_with_marker = campus_map.copy()
    
    # Draw a bigger red circle marker
    cv2.circle(map_with_marker, (x_pixel, y_pixel), 35, (0, 0, 255), -1)  # Filled red circle (bigger)
    cv2.circle(map_with_marker, (x_pixel, y_pixel), 40, (255, 255, 255), 4)  # White border (bigger)
    
    # Draw bigger crosshairs
    cv2.line(map_with_marker, (x_pixel - 25, y_pixel), (x_pixel + 25, y_pixel), (255, 255, 255), 4)
    cv2.line(map_with_marker, (x_pixel, y_pixel - 25), (x_pixel, y_pixel + 25), (255, 255, 255), 4)
    
    # Add text with coordinates
    text = f"({x_percent:.1f}%, {y_percent:.1f}%)"
    text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
    
    # Position text to avoid going off screen
    text_x = max(10, min(x_pixel + 30, map_width - text_size[0] - 10))
    text_y = max(30, y_pixel - 30)
    
    # Draw text background
    cv2.rectangle(map_with_marker, 
                 (text_x - 5, text_y - 25), 
                 (text_x + text_size[0] + 5, text_y + 5), 
                 (255, 255, 255), -1)
    
    # Draw text
    cv2.putText(map_with_marker, text, (text_x, text_y), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    
    # Resize if the image is too large for the screen
    screen_height = 800
    if map_height > screen_height:
        scale = screen_height / map_height
        new_width = int(map_width * scale)
        map_with_marker = cv2.resize(map_with_marker, (new_width, screen_height))
    
    # Display the map
    cv2.imshow("UW Campus Map with Location", map_with_marker)
    cv2.waitKey(1)  # Brief display to show the map

def get_location():
    return collection.find_one({"status": "needs approval",})

location_data = get_location()

while location_data:
    locationUrl = location_data["image"]

    xCoor = location_data["xCoordinate"]
    yCoor = location_data["yCoordinate"]

    print(f"Location coordinates: ({xCoor}%, {yCoor}%)")

    # Display the campus map with marker
    display_campus_map_with_marker_opencv(xCoor, yCoor)

    # Download and display the actual location image
    response = requests.get(locationUrl)
    image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
    img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    # Show the location image
    cv2.imshow("Location Image", img)
    
    print("Press 'y' to approve, 'n' to reject, or any other key to continue...")
    key = cv2.waitKey(0)
    
    if key == ord('y') or key == ord('n'):
        cv2.destroyAllWindows()

        # Update the document based on user input
        if key == ord('y'):
            collection.update_one(
                {"_id": location_data["_id"]},
                {
                    "$set": {
                        "status": "approved",
                    }
                }
            )
            print("Location approved!")
        else:
            collection.update_one(
                {"_id": location_data["_id"]},
                {
                    "$set": {
                        "status": "rejected",
                    }
                    
                }
            )
            print("Location rejected!")
    else:
        cv2.destroyAllWindows()
        print("Skipping to next location...")

    # Get the next location
    location_data = get_location()