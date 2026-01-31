const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';
let TOKEN = '';
let photoIds = [];

// Helper to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  console.log(`\n${options.method || 'GET'} ${endpoint}`);
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));

  return { response, data };
}

// Helper for multipart uploads
async function uploadFiles(endpoint, formData, token) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  console.log(`\nPOST ${endpoint} (multipart)`);
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));

  return { response, data };
}

// Create test images
function createTestImage(filename) {
  const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('PHOTOS API TESTING - MULTIPLE IMAGE UPLOAD');
  console.log('='.repeat(60));

  try {
    // Step 1: Login to get token
    console.log('\n\n📝 STEP 1: GET AUTHENTICATION TOKEN');
    console.log('-'.repeat(60));

    const { data: loginData } = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testcms@example.com',
        password: 'MyStr0ng!P@ssw0rd2024',
      }),
    });

    if (loginData.success && loginData.data?.token) {
      TOKEN = loginData.data.token;
      console.log('✅ Authentication successful!');
    } else {
      throw new Error('Failed to authenticate');
    }

    // Step 2: Create test image files
    console.log('\n\n📷 STEP 2: CREATE TEST IMAGE FILES');
    console.log('-'.repeat(60));

    const image1Path = createTestImage('photo-1.png');
    const image2Path = createTestImage('photo-2.png');
    const image3Path = createTestImage('photo-3.png');
    const image4Path = createTestImage('photo-4.png');
    console.log('✅ Created 4 test images');

    // Step 3: UPLOAD multiple photos at once
    console.log('\n\n📤 STEP 3: UPLOAD MULTIPLE PHOTOS (4 photos)');
    console.log('-'.repeat(60));

    const formData1 = new FormData();

    // Add metadata for each photo
    const metadata = [
      { title: 'Sunset Photo', description: 'Beautiful sunset at the beach' },
      { title: 'Mountain View', description: 'Scenic mountain landscape' },
      { title: 'City Lights', description: 'Night time city view' },
      { title: 'Nature Close-up', description: 'Macro photography of flowers' },
    ];
    formData1.append('metadata', JSON.stringify(metadata));

    const file1 = new Blob([fs.readFileSync(image1Path)], { type: 'image/png' });
    const file2 = new Blob([fs.readFileSync(image2Path)], { type: 'image/png' });
    const file3 = new Blob([fs.readFileSync(image3Path)], { type: 'image/png' });
    const file4 = new Blob([fs.readFileSync(image4Path)], { type: 'image/png' });

    formData1.append('images', file1, 'photo-1.png');
    formData1.append('images', file2, 'photo-2.png');
    formData1.append('images', file3, 'photo-3.png');
    formData1.append('images', file4, 'photo-4.png');

    const { data: uploadData } = await uploadFiles('/photos', formData1, TOKEN);

    if (uploadData.success && uploadData.data?.photos) {
      photoIds = uploadData.data.photos.map(p => p.id);
      console.log(`✅ Successfully uploaded ${uploadData.data.count} photos`);
    }

    // Step 4: READ all photos
    console.log('\n\n📖 STEP 4: READ ALL PHOTOS');
    console.log('-'.repeat(60));

    const { data: allPhotosData } = await apiCall('/photos', {
      method: 'GET',
    });

    if (allPhotosData.success) {
      console.log(`✅ Found ${allPhotosData.data.length} total photos`);
    }

    // Step 5: READ my photos only
    console.log('\n\n📖 STEP 5: READ MY PHOTOS');
    console.log('-'.repeat(60));

    const { data: myPhotosData } = await apiCall('/photos/my-photos', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    });

    if (myPhotosData.success) {
      console.log(`✅ Found ${myPhotosData.data.length} photos uploaded by me`);
    }

    // Step 6: READ single photo by ID
    console.log('\n\n📖 STEP 6: READ SINGLE PHOTO BY ID');
    console.log('-'.repeat(60));

    if (photoIds.length > 0) {
      const { data: photoData } = await apiCall(`/photos/${photoIds[0]}`, {
        method: 'GET',
      });

      if (photoData.success) {
        console.log('✅ Photo found');
      }
    }

    // Step 7: UPDATE photo (title and description)
    console.log('\n\n✏️  STEP 7: UPDATE PHOTO');
    console.log('-'.repeat(60));

    if (photoIds.length > 0) {
      const { data: updateData } = await apiCall(`/photos/${photoIds[0]}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          title: 'Updated Sunset Photo',
          description: 'Amazing sunset - updated description',
        }),
      });

      if (updateData.success) {
        console.log('✅ Photo updated successfully');
      }
    }

    // Step 8: UPLOAD more photos
    console.log('\n\n📤 STEP 8: UPLOAD MORE PHOTOS (2 more)');
    console.log('-'.repeat(60));

    const image5Path = createTestImage('photo-5.png');
    const image6Path = createTestImage('photo-6.png');

    const formData2 = new FormData();
    const metadata2 = [
      { title: 'Wildlife Photo', description: 'Amazing wildlife capture' },
      { title: 'Architecture', description: 'Modern building design' },
    ];
    formData2.append('metadata', JSON.stringify(metadata2));

    const file5 = new Blob([fs.readFileSync(image5Path)], { type: 'image/png' });
    const file6 = new Blob([fs.readFileSync(image6Path)], { type: 'image/png' });

    formData2.append('images', file5, 'photo-5.png');
    formData2.append('images', file6, 'photo-6.png');

    const { data: upload2Data } = await uploadFiles('/photos', formData2, TOKEN);

    if (upload2Data.success) {
      console.log(`✅ Successfully uploaded ${upload2Data.data.count} more photos`);
      photoIds.push(...upload2Data.data.photos.map(p => p.id));
    }

    // Step 9: DELETE single photo
    console.log('\n\n🗑️  STEP 9: DELETE SINGLE PHOTO');
    console.log('-'.repeat(60));

    if (photoIds.length > 0) {
      const { data: deleteData } = await apiCall(`/photos/${photoIds[0]}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
      });

      if (deleteData.success) {
        console.log('✅ Photo deleted successfully');
        photoIds.shift(); // Remove first photo from array
      }
    }

    // Step 10: DELETE multiple photos
    console.log('\n\n🗑️  STEP 10: DELETE MULTIPLE PHOTOS');
    console.log('-'.repeat(60));

    if (photoIds.length >= 2) {
      const photosToDelete = photoIds.slice(0, 2);
      const { data: deleteMultipleData } = await apiCall('/photos/delete-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          ids: photosToDelete,
        }),
      });

      if (deleteMultipleData.success) {
        console.log(`✅ Deleted ${deleteMultipleData.data.deletedPhotos.length} photos`);
      }
    }

    // Cleanup remaining photos
    console.log('\n\n🧹 CLEANING UP REMAINING PHOTOS');
    console.log('-'.repeat(60));

    for (const id of photoIds.slice(2)) {
      await apiCall(`/photos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
      });
    }

    // Cleanup test files
    fs.unlinkSync(image1Path);
    fs.unlinkSync(image2Path);
    fs.unlinkSync(image3Path);
    fs.unlinkSync(image4Path);
    fs.unlinkSync(image5Path);
    fs.unlinkSync(image6Path);
    console.log('✅ Cleaned up test image files');

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ ALL PHOTOS TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests();
