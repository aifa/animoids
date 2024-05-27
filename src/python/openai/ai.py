import argparse
from openai import OpenAI
import yaml
from dotenv import load_dotenv
import os
import requests
import json
import sys

load_dotenv()

open_ai_key = os.getenv("OPENAI_API_KEY")

# Function to load and fill the prompt template from a YAML file
def load_prompt_template(yaml_path, **kwargs):
    with open(yaml_path, 'r') as file:
        data = yaml.safe_load(file)
    template = data['prompt']
    return template.format(**kwargs)


def submit_request(ipfs_url):
    yaml_path = 'prompt.yaml'
    prompt = load_prompt_template(yaml_path)

    client = OpenAI()

    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {open_ai_key}"
    }

    payload = {
    "model": "gpt-4o",
    "response_format": { "type": "json_object" },
    "messages": [
        {
        "role": "user",
        "content": [
                {
                    "type": "text",
                    "text": f"{prompt}"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"{ipfs_url}"
                    }
                }
            ]
        }
    ],
    "max_tokens": 1000
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    try:
        content = response.json()
        print(content, file=sys.stdout)

        ai_response = content["choices"][0]["message"]["content"]
        print(ai_response, file=sys.stdout)
        # Convert the AI response to a JSON object
        ai_response_json = json.loads(ai_response)
        print(ai_response_json)
        # Read the sha256 value from the JSON object
        sha256 = ai_response_json["hash"]
        print(f"SHA256: {sha256}")
        output_folder = os.getenv("OUTPUT_DIR")
        if output_folder:
            output_file = os.path.join(output_folder, "response.txt")
            with open(output_file, "w") as file:
                file.write(ai_response)
                print(f"Response saved to {output_file}")
        else:
            print("OUTPUT environment variable not defined. Response will not be saved.", file=sys.stderr)
    except KeyError:
        print("Error: Invalid response format.", file=sys.stderr)

    return ai_response


if __name__ == "__main__":
    #ipfs_url = "https://bafybeib76s7igm5ncpg3n3eno64bjhak62ua2gyqzdruaxvejngh4inxui.ipfs.w3s.link/Pope-Francis-Coat.jpg"
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Analyse an image and detect if it has been generated or modified by AI.")
    parser.add_argument("--img_url", help="The URL of the image to be analyzed.")
    args = parser.parse_args()
    submit_request(args.img_url)
    