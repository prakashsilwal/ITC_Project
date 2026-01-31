const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/v1';
let TOKEN = '';
let galleryId = '';
let imageId = '';
let videoId = '';

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
  console.log('CMS API TESTING - FULL CRUD OPERATIONS');
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
      console.log('❌ Login failed. Trying to create new user...');

      const { data: signupData } = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: 'testcms@example.com',
          password: 'MyStr0ng!P@ssw0rd2024',
          country: 'USA',
          countryCode: '+1',
          phoneNumber: '1234567890',
        }),
      });

      if (signupData.success) {
        console.log('✅ New user created! Now logging in...');

        // Login with new credentials
        const { data: newLoginData } = await apiCall('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'testcms@example.com',
            password: 'MyStr0ng!P@ssw0rd2024',
          }),
        });

        if (newLoginData.success && newLoginData.data?.token) {
          TOKEN = newLoginData.data.token;
          console.log('✅ Logged in successfully!');
        } else {
          throw new Error('Failed to login after signup');
        }
      } else {
        throw new Error('Failed to authenticate');
      }
    }

    // Step 2: Create test image files
    console.log('\n\n📷 STEP 2: CREATE TEST IMAGE FILES');
    console.log('-'.repeat(60));

    const image1Path = createTestImage('test-image-1.png');
    const image2Path = createTestImage('test-image-2.png');
    const image3Path = createTestImage('test-image-3.png');
    console.log('✅ Created 3 test images');

    // Step 3: CREATE Gallery with multiple images
    console.log('\n\n🖼️  STEP 3: CREATE GALLERY (with 2 images)');
    console.log('-'.repeat(60));

    const formData1 = new FormData();
    formData1.append('title', 'My First Gallery');
    formData1.append('description', 'This is a test gallery with multiple images');

    const file1 = new Blob([fs.readFileSync(image1Path)], { type: 'image/png' });
    const file2 = new Blob([fs.readFileSync(image2Path)], { type: 'image/png' });
    formData1.append('images', file1, 'test-image-1.png');
    formData1.append('images', file2, 'test-image-2.png');

    const { data: createGalleryData } = await uploadFiles('/cms/galleries', formData1, TOKEN);

    if (createGalleryData.success && createGalleryData.data) {
      galleryId = createGalleryData.data.id;
      if (createGalleryData.data.images && createGalleryData.data.images.length > 0) {
        imageId = createGalleryData.data.images[0].id;
      }
      console.log(`✅ Gallery created! ID: ${galleryId}`);
      console.log(`✅ Uploaded ${createGalleryData.data.images.length} images`);
    }

    // Step 4: READ all galleries
    console.log('\n\n📖 STEP 4: READ ALL GALLERIES');
    console.log('-'.repeat(60));

    const { data: galleriesData } = await apiCall('/cms/galleries', {
      method: 'GET',
    });

    if (galleriesData.success) {
      console.log(`✅ Found ${galleriesData.data.length} galleries`);
    }

    // Step 5: READ single gallery by ID
    console.log('\n\n📖 STEP 5: READ SINGLE GALLERY BY ID');
    console.log('-'.repeat(60));

    const { data: galleryData } = await apiCall(`/cms/galleries/${galleryId}`, {
      method: 'GET',
    });

    if (galleryData.success) {
      console.log(`✅ Gallery found with ${galleryData.data.images.length} images`);
    }

    // Step 6: UPDATE gallery (add more images)
    console.log('\n\n✏️  STEP 6: UPDATE GALLERY (add 1 more image)');
    console.log('-'.repeat(60));

    const formData2 = new FormData();
    formData2.append('title', 'My Updated Gallery');
    formData2.append('description', 'Updated description with more images');

    const file3 = new Blob([fs.readFileSync(image3Path)], { type: 'image/png' });
    formData2.append('images', file3, 'test-image-3.png');

    const updateResponse = await fetch(`${BASE_URL}/cms/galleries/${galleryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: formData2,
    });

    const updateData = await updateResponse.json();
    console.log('Status:', updateResponse.status);
    console.log('Response:', JSON.stringify(updateData, null, 2));

    if (updateData.success) {
      console.log(`✅ Gallery updated! Now has ${updateData.data.images.length} images`);
    }

    // Step 7: DELETE single image from gallery
    console.log('\n\n🗑️  STEP 7: DELETE SINGLE IMAGE FROM GALLERY');
    console.log('-'.repeat(60));

    const { data: deleteImageData } = await apiCall(`/cms/galleries/${galleryId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    });

    if (deleteImageData.success) {
      console.log('✅ Image deleted successfully');
    }

    // Step 8: CREATE YouTube video
    console.log('\n\n🎥 STEP 8: CREATE VIDEO (YouTube link)');
    console.log('-'.repeat(60));

    const { data: createVideoData } = await apiCall('/cms/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        title: 'Amazing Tutorial Video',
        description: 'This is a great tutorial on YouTube',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      }),
    });

    if (createVideoData.success && createVideoData.data) {
      videoId = createVideoData.data.id;
      console.log(`✅ Video created! ID: ${videoId}`);
    }

    // Step 9: READ all videos
    console.log('\n\n📖 STEP 9: READ ALL VIDEOS');
    console.log('-'.repeat(60));

    const { data: videosData } = await apiCall('/cms/videos', {
      method: 'GET',
    });

    if (videosData.success) {
      console.log(`✅ Found ${videosData.data.length} videos`);
    }

    // Step 10: READ single video by ID
    console.log('\n\n📖 STEP 10: READ SINGLE VIDEO BY ID');
    console.log('-'.repeat(60));

    const { data: videoData } = await apiCall(`/cms/videos/${videoId}`, {
      method: 'GET',
    });

    if (videoData.success) {
      console.log('✅ Video found');
    }

    // Step 11: UPDATE video
    console.log('\n\n✏️  STEP 11: UPDATE VIDEO');
    console.log('-'.repeat(60));

    const { data: updateVideoData } = await apiCall(`/cms/videos/${videoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        title: 'Updated Amazing Tutorial Video',
        description: 'Updated description for this video',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
    });

    if (updateVideoData.success) {
      console.log('✅ Video updated successfully');
    }

    // Step 12: DELETE video
    console.log('\n\n🗑️  STEP 12: DELETE VIDEO');
    console.log('-'.repeat(60));

    const { data: deleteVideoData } = await apiCall(`/cms/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    });

    if (deleteVideoData.success) {
      console.log('✅ Video deleted successfully');
    }

    // Step 13: DELETE gallery
    console.log('\n\n🗑️  STEP 13: DELETE GALLERY');
    console.log('-'.repeat(60));

    const { data: deleteGalleryData } = await apiCall(`/cms/galleries/${galleryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    });

    if (deleteGalleryData.success) {
      console.log('✅ Gallery deleted successfully');
    }

    // Cleanup test files
    fs.unlinkSync(image1Path);
    fs.unlinkSync(image2Path);
    fs.unlinkSync(image3Path);
    console.log('\n✅ Cleaned up test image files');

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests();
