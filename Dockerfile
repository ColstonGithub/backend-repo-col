# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 5000 for the backend service
EXPOSE 5000

# Environment variables for connecting to the MongoDB instance
ENV NODE_ENV=production
ENV MONGODB_URI="mongodb+srv://doadmin:4o315mdMkp9l7s20@colston-web-mongodb-blr1-52085-2b1f7ade.mongo.ondigitalocean.com/admin?tls=true&authSource=admin&replicaSet=colston-web-mongodb-blr1-52085"

# Command to start the backend service
CMD ["npm", "start"]
