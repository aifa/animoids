# Use an official Python runtime as a parent image
FROM python:3.10-slim

RUN mkdir /app
WORKDIR /app

RUN mkdir -p /outputs

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Run the script when the container launches
ENTRYPOINT ["python", "ai.py"]  # Replace with your script name and IPFS link if static, or handle args in entrypoint
