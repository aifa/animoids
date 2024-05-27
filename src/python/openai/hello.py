import sys

import requests
import base64

def fetch_file_from_ipfs(cid):
    # IPFS gateway URL
    url = f"https://ipfs.io/ipfs/{cid}"
    
    # Send GET request to fetch the file
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.content
    else:
        raise Exception(f"Failed to fetch file from IPFS. Status code: {response.status_code}")

def encode_file_base64(file_content, cid):
    # Encode the file content in base64
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

        # Write the image data to a file
    with open(cid, 'wb') as image_file:
        image_file.write(encoded_string)

    return encoded_string

def decode_base64_to_image(encoded_content, output_file_path):
    # Decode the base64 content
    image_data = base64.b64decode(encoded_content)
    
    # Write the image data to a file
    with open(output_file_path, 'wb') as image_file:
        image_file.write(image_data)
    
    print(f"Image saved to {output_file_path}")

def main():
    # CID of the file on IPFS
    cid = "QmTNun11hdjvh15xd8dGR8GePuQM4FDdCBmbvbBG3RLHFT"  # Replace with your actual CID
    
    try:
        # Fetch file from IPFS
        file_content = fetch_file_from_ipfs(cid)
        print("File fetched successfully from IPFS.")
        
        # Encode the file in base64
        encoded_content = encode_file_base64(file_content, cid)
        print("File encoded in base64 successfully.")
        
        # Print or save the encoded content
        print(encoded_content)

        # Decode the base64 content and save it as an image
        output_file_path = "./output_image.png"  # Specify your desired output file path
        decode_base64_to_image(encoded_content, output_file_path)
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()