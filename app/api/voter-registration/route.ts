import { NextRequest, NextResponse } from 'next/server';

interface VoterRegistration {
  id: string;
  walletAddress: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  registrationDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  eligibleElections: string[];
  documents: {
    idDocument: string;
    proofOfAddress: string;
  };
  verificationNotes?: string;
  lastUpdated: Date;
}

interface RegistrationFormData {
  walletAddress: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId: string;
  email: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Mock voter registrations - in a real app, this would be stored in a database
let mockRegistrations: VoterRegistration[] = [
  {
    id: 'voter-001',
    walletAddress: '0x1234567890123456789012345678901234567890',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    nationalId: 'SSN123456789',
    email: 'john.doe@example.com',
    phoneNumber: '+1-555-0123',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    registrationDate: new Date('2024-01-15'),
    verificationStatus: 'verified',
    eligibleElections: ['national-2024', 'provincial-2024'],
    documents: {
      idDocument: 'id-doc-001.pdf',
      proofOfAddress: 'address-proof-001.pdf'
    },
    lastUpdated: new Date('2024-01-20')
  },
  {
    id: 'voter-002',
    walletAddress: '0x2345678901234567890123456789012345678901',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1985-08-22',
    nationalId: 'SSN987654321',
    email: 'jane.smith@example.com',
    phoneNumber: '+1-555-0456',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'United States'
    },
    registrationDate: new Date('2024-02-01'),
    verificationStatus: 'pending',
    eligibleElections: [],
    documents: {
      idDocument: 'id-doc-002.pdf',
      proofOfAddress: 'address-proof-002.pdf'
    },
    lastUpdated: new Date('2024-02-01')
  }
];

// Helper function to generate unique registration ID
function generateRegistrationId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `voter-${timestamp}-${random}`;
}

// Helper function to validate registration data
function validateRegistrationData(data: RegistrationFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  const requiredFields = [
    'walletAddress', 'firstName', 'lastName', 'dateOfBirth', 'nationalId',
    'email', 'phoneNumber', 'street', 'city', 'state', 'zipCode', 'country'
  ];

  for (const field of requiredFields) {
    if (!data[field as keyof RegistrationFormData]?.toString().trim()) {
      errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Wallet address validation
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  if (data.walletAddress && !walletRegex.test(data.walletAddress)) {
    errors.push('Invalid wallet address format');
  }

  // Age validation (must be 18+)
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      errors.push('Must be at least 18 years old to register');
    }
  }

  // National ID validation (basic check)
  if (data.nationalId && data.nationalId.length < 5) {
    errors.push('National ID must be at least 5 characters');
  }

  // Phone number validation (basic check)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (data.phoneNumber && !phoneRegex.test(data.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Invalid phone number format');
  }

  // Check for duplicate registrations
  const existingRegistration = mockRegistrations.find(
    reg => reg.walletAddress.toLowerCase() === data.walletAddress.toLowerCase() ||
           reg.nationalId === data.nationalId ||
           reg.email.toLowerCase() === data.email.toLowerCase()
  );

  if (existingRegistration) {
    if (existingRegistration.walletAddress.toLowerCase() === data.walletAddress.toLowerCase()) {
      errors.push('Wallet address already registered');
    }
    if (existingRegistration.nationalId === data.nationalId) {
      errors.push('National ID already registered');
    }
    if (existingRegistration.email.toLowerCase() === data.email.toLowerCase()) {
      errors.push('Email address already registered');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to determine eligible elections based on address
function determineEligibleElections(address: { state: string; country: string }): string[] {
  const eligibleElections: string[] = [];

  // All verified voters are eligible for national elections
  eligibleElections.push('national-2024');

  // State-specific eligibility
  if (address.country === 'United States') {
    eligibleElections.push('provincial-2024');
    
    // Municipal elections based on state
    if (['NY', 'CA', 'TX', 'FL'].includes(address.state)) {
      eligibleElections.push('municipal-2024');
    }
  }

  return eligibleElections;
}

// GET /api/voter-registration - Get voter registration by wallet address
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get('walletAddress');
    const registrationId = url.searchParams.get('id');

    if (registrationId) {
      // Get specific registration by ID
      const registration = mockRegistrations.find(reg => reg.id === registrationId);
      
      if (!registration) {
        return NextResponse.json(
          { success: false, message: 'Registration not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        registration
      });
    }

    if (walletAddress) {
      // Get registration by wallet address
      const registration = mockRegistrations.find(
        reg => reg.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );

      if (!registration) {
        return NextResponse.json({
          success: true,
          registration: null,
          message: 'No registration found for this wallet address'
        });
      }

      return NextResponse.json({
        success: true,
        registration
      });
    }

    // Get all registrations (admin only - in a real app, this would require admin auth)
    const stats = {
      total: mockRegistrations.length,
      verified: mockRegistrations.filter(reg => reg.verificationStatus === 'verified').length,
      pending: mockRegistrations.filter(reg => reg.verificationStatus === 'pending').length,
      rejected: mockRegistrations.filter(reg => reg.verificationStatus === 'rejected').length
    };

    return NextResponse.json({
      success: true,
      registrations: mockRegistrations,
      stats
    });

  } catch (error) {
    console.error('Error fetching voter registration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch voter registration' },
      { status: 500 }
    );
  }
}

// POST /api/voter-registration - Create new voter registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegistrationFormData;

    // Validate registration data
    const validation = validateRegistrationData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Create new registration
    const newRegistration: VoterRegistration = {
      id: generateRegistrationId(),
      walletAddress: body.walletAddress.toLowerCase(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      dateOfBirth: body.dateOfBirth,
      nationalId: body.nationalId.trim(),
      email: body.email.toLowerCase().trim(),
      phoneNumber: body.phoneNumber.trim(),
      address: {
        street: body.street.trim(),
        city: body.city.trim(),
        state: body.state.trim(),
        zipCode: body.zipCode.trim(),
        country: body.country.trim()
      },
      registrationDate: new Date(),
      verificationStatus: 'pending',
      eligibleElections: [], // Will be populated after verification
      documents: {
        idDocument: '', // Would be populated with actual document uploads
        proofOfAddress: ''
      },
      lastUpdated: new Date()
    };

    // Add to mock registrations
    mockRegistrations.push(newRegistration);

    // Log registration action
    console.log(`New voter registration submitted: ${newRegistration.firstName} ${newRegistration.lastName} (${newRegistration.id}) at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully',
      registration: newRegistration
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating voter registration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create voter registration' },
      { status: 500 }
    );
  }
}

// PUT /api/voter-registration - Update voter registration (for verification)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationId, verificationStatus, verificationNotes, adminAddress } = body;

    // Validate required fields
    if (!registrationId || !verificationStatus) {
      return NextResponse.json(
        { success: false, message: 'Registration ID and verification status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!validStatuses.includes(verificationStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification status' },
        { status: 400 }
      );
    }

    // Find registration
    const registrationIndex = mockRegistrations.findIndex(reg => reg.id === registrationId);
    if (registrationIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    const registration = mockRegistrations[registrationIndex];

    // Update registration
    const updatedRegistration: VoterRegistration = {
      ...registration,
      verificationStatus,
      verificationNotes,
      eligibleElections: verificationStatus === 'verified' 
        ? determineEligibleElections(registration.address)
        : [],
      lastUpdated: new Date()
    };

    mockRegistrations[registrationIndex] = updatedRegistration;

    // Log verification action
    console.log(`Voter registration ${verificationStatus}: ${registration.firstName} ${registration.lastName} (${registrationId}) by ${adminAddress || 'system'} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Registration ${verificationStatus} successfully`,
      registration: updatedRegistration
    });

  } catch (error) {
    console.error('Error updating voter registration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update voter registration' },
      { status: 500 }
    );
  }
}

// DELETE /api/voter-registration - Delete voter registration
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const registrationId = url.searchParams.get('id');
    const walletAddress = url.searchParams.get('walletAddress');

    if (!registrationId && !walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Registration ID or wallet address is required' },
        { status: 400 }
      );
    }

    // Find registration
    const registrationIndex = mockRegistrations.findIndex(reg => 
      (registrationId && reg.id === registrationId) ||
      (walletAddress && reg.walletAddress.toLowerCase() === walletAddress.toLowerCase())
    );

    if (registrationIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    const registration = mockRegistrations[registrationIndex];

    // Remove registration
    mockRegistrations.splice(registrationIndex, 1);

    // Log deletion action
    console.log(`Voter registration deleted: ${registration.firstName} ${registration.lastName} (${registration.id}) at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting voter registration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete voter registration' },
      { status: 500 }
    );
  }
}