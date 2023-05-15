# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Set environment variables
ENV PORT=5000
ENV MONGODB_URI=mongodb+srv://doadmin:4o315mdMkp9l7s20@colston-web-mongodb-blr1-52085-2b1f7ade.mongo.ondigitalocean.com/admin?tls=true&authSource=admin&replicaSet=colston-web-mongodb-blr1-52085
# Start the app
CMD [ "npm", "start" ]