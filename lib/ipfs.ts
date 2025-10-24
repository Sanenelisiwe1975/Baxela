// IPFS utility functions using Pinata
interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface IncidentIPFSData {
  id: string;
  title: string;
  category: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  reportedBy: string;
  timestamp: string;
  severity: string;
  attachments?: string[];
}

export class IPFSService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.pinata.cloud';

  constructor() {
    this.apiKey = process.env.PINATA_API_KEY || '';
    this.apiSecret = process.env.PINATA_API_SECRET || '';
    
    // Don't throw error in constructor - let individual methods handle it
    if (!this.apiKey || !this.apiSecret) {
      console.warn('Pinata API credentials not found in environment variables. IPFS functionality will be disabled.');
    }
  }

  /**
   * Upload incident data to IPFS via Pinata
   */
  async uploadIncidentData(incidentData: IncidentIPFSData): Promise<string> {
    // Check if credentials are properly configured
    if (!this.apiKey || !this.apiSecret || 
        this.apiKey === 'your-pinata-api-key-here' || 
        this.apiSecret === 'your-pinata-api-secret-here') {
      throw new Error('IPFS credentials not configured. Please set PINATA_API_KEY and PINATA_API_SECRET in .env.local');
    }

    try {
      const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
        body: JSON.stringify({
          pinataContent: incidentData,
          pinataMetadata: {
            name: `incident-${incidentData.id}`,
            keyvalues: {
              type: 'incident_report',
              category: incidentData.category,
              severity: incidentData.severity,
              timestamp: incidentData.timestamp
            }
          },
          pinataOptions: {
            cidVersion: 1
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} - ${errorData}`);
      }

      const result: PinataResponse = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error(`Failed to upload incident to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve incident data from IPFS
   */
  async getIncidentData(ipfsHash: string): Promise<any> {
    // Check if credentials are properly configured
    if (!this.apiKey || !this.apiSecret || 
        this.apiKey === 'your-pinata-api-key-here' || 
        this.apiSecret === 'your-pinata-api-secret-here') {
      throw new Error('IPFS credentials not configured. Please set PINATA_API_KEY and PINATA_API_SECRET in .env.local');
    }

    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch from IPFS: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw new Error(`Failed to retrieve incident from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: File): Promise<string> {
    // Check if credentials are properly configured
    if (!this.apiKey || !this.apiSecret || 
        this.apiKey === 'your-pinata-api-key-here' || 
        this.apiSecret === 'your-pinata-api-secret-here') {
      throw new Error('IPFS credentials not configured. Please set PINATA_API_KEY and PINATA_API_SECRET in .env.local');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: 'incident_attachment',
          filename: file.name,
          size: file.size.toString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', options);

      const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`File upload failed: ${response.status} - ${errorData}`);
      }

      const result: PinataResponse = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test Pinata connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing Pinata connection:', error);
      return false;
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();