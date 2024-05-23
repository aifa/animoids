# Use an official Python runtime as a parent image
FROM python:3.10-slim

RUN mkdir /app
WORKDIR /app

RUN mkdir -p /inputs 
RUN mkdir -p /outputs

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

ENV OUTPUT_DIR="/outputs/"

RUN python ai.py --img_url=https://bafybeib76s7igm5ncpg3n3eno64bjhak62ua2gyqzdruaxvejngh4inxui.ipfs.w3s.link/Pope-Francis-Coat.jpg



# Run the script when the container launches
ENTRYPOINT ["python", "ai.py"]  # Replace with your script name and IPFS link if static, or handle args in entrypoint
