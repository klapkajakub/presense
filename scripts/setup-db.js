/**
 * MongoDB Setup Script
 * 
 * This script initializes the MongoDB database with the necessary
 * collections and indexes for the business information.
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10
    });
    
    console.log('Connected to MongoDB');
    
    // Define the schemas
    const businessSchema = new mongoose.Schema({
      name: String,
      description: String,
      platformVariants: { type: Map, of: String },
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
      },
      contact: {
        phone: String,
        email: String,
        website: String
      },
      categories: [String]
    }, { timestamps: true, collection: 'businesses' });
    
    const businessDescriptionSchema = new mongoose.Schema({
      descriptions: {
        google: String,
        facebook: String,
        firmy: String,
        instagram: String
      }
    }, { timestamps: true, collection: 'businessDescriptions' });
    
    // Create or get the models
    const Business = mongoose.models.Business || mongoose.model('Business', businessSchema);
    const BusinessDescription = mongoose.models.BusinessDescription || 
      mongoose.model('BusinessDescription', businessDescriptionSchema);
    
    // Create sample data if collections are empty
    const businessCount = await Business.countDocuments();
    if (businessCount === 0) {
      console.log('Creating sample business data...');
      await Business.create({
        name: 'Sample Business',
        description: 'This is a sample business description for demonstration purposes.',
        contact: {
          email: 'sample@example.com',
          phone: '+1234567890'
        }
      });
      console.log('Sample business created');
    }
    
    const descriptionCount = await BusinessDescription.countDocuments();
    if (descriptionCount === 0) {
      console.log('Creating sample business descriptions...');
      await BusinessDescription.create({
        descriptions: {
          google: 'This is a sample Google Business description. Limited to 750 characters.',
          facebook: 'This is a sample Facebook description. Limited to 1000 characters.',
          instagram: 'Sample Instagram bio. Limited to 150 characters.',
          firmy: 'Sample Firmy.cz description. Limited to 500 characters.'
        }
      });
      console.log('Sample business descriptions created');
    }
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupDatabase().then(() => {
  console.log('Setup script execution completed');
  process.exit(0);
}).catch(error => {
  console.error('Setup script execution failed:', error);
  process.exit(1);
}); 