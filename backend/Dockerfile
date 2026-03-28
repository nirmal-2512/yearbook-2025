# Use a more recent version of Node.js (e.g., node:18)
FROM node:18 AS build


# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) for installing dependencies
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 5000 (assuming your backend listens on port 5000)
EXPOSE 5000

# Command to start your Node.js app
CMD ["npm", "start"]
