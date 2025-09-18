import pymongo
from dotenv import find_dotenv, load_dotenv, dotenv_values
import cv2
import numpy as np
import requests

load_dotenv(find_dotenv("../.env"))


client = pymongo.MongoClient(
    dotenv_values()["MONGODB_URI"]
)

collection = client.get_database("UWguesser").get_collection("posters")

def get_poster():
    return collection.find_one(
        {
            "show": False,
            "$or": [
                {"cancel": False},
                {"cancel": {"$exists": False}}
                ]
        })

poster_data = get_poster()

while poster_data:
    posterUrl = poster_data["posterUrl"]

    # Download the image
    response = requests.get(posterUrl)
    image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
    img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    # Show the image
    cv2.imshow("Poster", img)
    key = cv2.waitKey(0)
    if key == ord('y') or key == ord('n'):
        cv2.destroyAllWindows()

        # Update the document based on user input
        if key == ord('y'):
            collection.update_one(
                {"_id": poster_data["_id"]},
                {
                    "$set": {
                        "show": True,
                    }
                }
            )
        else:
            collection.update_one(
                {"_id": poster_data["_id"]},
                {
                    "$set": {
                        "show": False,
                        "cancel": True,
                    }
                    
                }
            )


    # Get the next poster
    poster_data = get_poster()