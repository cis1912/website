# Pull from latest verision of Node
FROM node:latest

# Set the working directory to this directory (common place to 
# store application in the Linux file structure)
WORKDIR /usr/src/app

# Copy over package.json and packaage-lock.json (these files
# contain the necessary dependencies for our project)
COPY package*.json ./

# Install dependencies for our project
RUN npm install

# Copy over all of the app source code
COPY . .

# Expose the port on which we will run our application
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
