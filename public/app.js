const API_BASE_URL = 'http://localhost:3000/api/v1';
let token = localStorage.getItem('token') || '';
let userData = JSON.parse(localStorage.getItem('userData') || '{}');

// Initialize app
window.onload = () => {
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }
};

// Authentication
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            token = data.data.token;
            userData = data.data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            showDashboard();
        } else {
            errorEl.textContent = data.error.message;
        }
    } catch (error) {
        errorEl.textContent = 'Login failed. Please try again.';
    }
}

function logout() {
    token = '';
    userData = {};
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    showLogin();
}

function showLogin() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('user-name').textContent = `${userData.firstName} ${userData.lastName}`;
    loadGalleries();
}

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Load data for the active tab
    if (tabName === 'galleries') loadGalleries();
    if (tabName === 'videos') loadVideos();
    if (tabName === 'photos') loadPhotos();
}

// GALLERIES
async function createGallery() {
    const title = document.getElementById('gallery-title').value;
    const description = document.getElementById('gallery-description').value;
    const files = document.getElementById('gallery-images').files;

    if (!title) {
        alert('Please enter a gallery title');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    if (description) formData.append('description', description);

    for (let file of files) {
        formData.append('images', file);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cms/galleries`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert('Gallery created successfully!');
            document.getElementById('gallery-title').value = '';
            document.getElementById('gallery-description').value = '';
            document.getElementById('gallery-images').value = '';
            loadGalleries();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to create gallery');
    }
}

async function loadGalleries() {
    const listEl = document.getElementById('galleries-list');
    listEl.innerHTML = '<div class="loading">Loading galleries...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/cms/galleries`);
        const data = await response.json();

        if (data.success) {
            if (data.data.length === 0) {
                listEl.innerHTML = '<p>No galleries found</p>';
                return;
            }

            listEl.innerHTML = data.data.map(gallery => `
                <div class="item">
                    <h4>${gallery.title}</h4>
                    <p>${gallery.description || 'No description'}</p>
                    <div class="item-images">
                        ${gallery.images.map(img => `
                            <img src="http://localhost:3000${img.filePath}" alt="${img.fileName}">
                        `).join('')}
                    </div>
                    <p><small>Uploaded by: ${gallery.uploader.firstName} ${gallery.uploader.lastName}</small></p>
                    <div class="item-actions">
                        <button onclick="openEditGallery('${gallery.id}')" class="btn btn-edit">Edit</button>
                        <button onclick="deleteGallery('${gallery.id}')" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        listEl.innerHTML = '<p class="error">Failed to load galleries</p>';
    }
}

async function openEditGallery(id) {
    const response = await fetch(`${API_BASE_URL}/cms/galleries/${id}`);
    const data = await response.json();

    if (data.success) {
        document.getElementById('edit-gallery-id').value = data.data.id;
        document.getElementById('edit-gallery-title').value = data.data.title;
        document.getElementById('edit-gallery-description').value = data.data.description || '';
        document.getElementById('edit-gallery-modal').classList.remove('hidden');
    }
}

async function updateGallery() {
    const id = document.getElementById('edit-gallery-id').value;
    const title = document.getElementById('edit-gallery-title').value;
    const description = document.getElementById('edit-gallery-description').value;
    const files = document.getElementById('edit-gallery-images').files;

    const formData = new FormData();
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    for (let file of files) {
        formData.append('images', file);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cms/galleries/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert('Gallery updated successfully!');
            closeModal('edit-gallery-modal');
            loadGalleries();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to update gallery');
    }
}

async function deleteGallery(id) {
    if (!confirm('Are you sure you want to delete this gallery?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cms/galleries/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            alert('Gallery deleted successfully!');
            loadGalleries();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to delete gallery');
    }
}

// VIDEOS
async function createVideo() {
    const title = document.getElementById('video-title').value;
    const description = document.getElementById('video-description').value;
    const youtubeUrl = document.getElementById('video-url').value;
    const thumbnailUrl = document.getElementById('video-thumbnail').value;

    if (!title || !youtubeUrl) {
        alert('Please enter title and YouTube URL');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cms/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, youtubeUrl, thumbnailUrl })
        });

        const data = await response.json();

        if (data.success) {
            alert('Video added successfully!');
            document.getElementById('video-title').value = '';
            document.getElementById('video-description').value = '';
            document.getElementById('video-url').value = '';
            document.getElementById('video-thumbnail').value = '';
            loadVideos();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to add video');
    }
}

async function loadVideos() {
    const listEl = document.getElementById('videos-list');
    listEl.innerHTML = '<div class="loading">Loading videos...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/cms/videos`);
        const data = await response.json();

        if (data.success) {
            if (data.data.length === 0) {
                listEl.innerHTML = '<p>No videos found</p>';
                return;
            }

            listEl.innerHTML = data.data.map(video => `
                <div class="item">
                    <h4>${video.title}</h4>
                    <p>${video.description || 'No description'}</p>
                    <p><a href="${video.youtubeUrl}" target="_blank">${video.youtubeUrl}</a></p>
                    ${video.thumbnailUrl ? `<img src="${video.thumbnailUrl}" alt="Thumbnail" style="max-width: 200px; border-radius: 8px;">` : ''}
                    <p><small>Uploaded by: ${video.uploader.firstName} ${video.uploader.lastName}</small></p>
                    <div class="item-actions">
                        <button onclick="openEditVideo('${video.id}')" class="btn btn-edit">Edit</button>
                        <button onclick="deleteVideo('${video.id}')" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        listEl.innerHTML = '<p class="error">Failed to load videos</p>';
    }
}

async function openEditVideo(id) {
    const response = await fetch(`${API_BASE_URL}/cms/videos/${id}`);
    const data = await response.json();

    if (data.success) {
        document.getElementById('edit-video-id').value = data.data.id;
        document.getElementById('edit-video-title').value = data.data.title;
        document.getElementById('edit-video-description').value = data.data.description || '';
        document.getElementById('edit-video-url').value = data.data.youtubeUrl;
        document.getElementById('edit-video-thumbnail').value = data.data.thumbnailUrl || '';
        document.getElementById('edit-video-modal').classList.remove('hidden');
    }
}

async function updateVideo() {
    const id = document.getElementById('edit-video-id').value;
    const title = document.getElementById('edit-video-title').value;
    const description = document.getElementById('edit-video-description').value;
    const youtubeUrl = document.getElementById('edit-video-url').value;
    const thumbnailUrl = document.getElementById('edit-video-thumbnail').value;

    try {
        const response = await fetch(`${API_BASE_URL}/cms/videos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, youtubeUrl, thumbnailUrl })
        });

        const data = await response.json();

        if (data.success) {
            alert('Video updated successfully!');
            closeModal('edit-video-modal');
            loadVideos();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to update video');
    }
}

async function deleteVideo(id) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cms/videos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            alert('Video deleted successfully!');
            loadVideos();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to delete video');
    }
}

// PHOTOS
document.getElementById('photos-files')?.addEventListener('change', function(e) {
    const files = e.target.files;
    const metadataDiv = document.getElementById('photos-metadata');

    let html = '<h4 style="margin: 15px 0 10px 0;">Add details for each photo:</h4>';
    for (let i = 0; i < files.length; i++) {
        html += `
            <div class="photo-metadata-item">
                <h4>Photo ${i + 1}: ${files[i].name}</h4>
                <input type="text" id="photo-title-${i}" placeholder="Title" value="Photo ${i + 1}">
                <textarea id="photo-description-${i}" placeholder="Description (optional)"></textarea>
            </div>
        `;
    }
    metadataDiv.innerHTML = html;
});

async function uploadPhotos() {
    const files = document.getElementById('photos-files').files;

    if (files.length === 0) {
        alert('Please select at least one photo');
        return;
    }

    const formData = new FormData();
    const metadata = [];

    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
        metadata.push({
            title: document.getElementById(`photo-title-${i}`)?.value || files[i].name,
            description: document.getElementById(`photo-description-${i}`)?.value || ''
        });
    }

    formData.append('metadata', JSON.stringify(metadata));

    try {
        const response = await fetch(`${API_BASE_URL}/photos`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert(`Successfully uploaded ${data.data.count} photos!`);
            document.getElementById('photos-files').value = '';
            document.getElementById('photos-metadata').innerHTML = '';
            loadPhotos();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to upload photos');
    }
}

async function loadPhotos() {
    const listEl = document.getElementById('photos-list');
    listEl.innerHTML = '<div class="loading">Loading photos...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/photos`);
        const data = await response.json();

        if (data.success) {
            if (data.data.length === 0) {
                listEl.innerHTML = '<p>No photos found</p>';
                return;
            }

            listEl.innerHTML = data.data.map(photo => `
                <div class="item">
                    <h4>${photo.title}</h4>
                    <p>${photo.description || 'No description'}</p>
                    <img src="http://localhost:3000${photo.filePath}" alt="${photo.title}" style="max-width: 300px; border-radius: 8px; margin: 10px 0;">
                    <p><small>Uploaded by: ${photo.uploader.firstName} ${photo.uploader.lastName}</small></p>
                    <div class="item-actions">
                        <button onclick="openEditPhoto('${photo.id}')" class="btn btn-edit">Edit</button>
                        <button onclick="deletePhoto('${photo.id}')" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        listEl.innerHTML = '<p class="error">Failed to load photos</p>';
    }
}

async function openEditPhoto(id) {
    const response = await fetch(`${API_BASE_URL}/photos/${id}`);
    const data = await response.json();

    if (data.success) {
        document.getElementById('edit-photo-id').value = data.data.id;
        document.getElementById('edit-photo-title').value = data.data.title;
        document.getElementById('edit-photo-description').value = data.data.description || '';
        document.getElementById('edit-photo-modal').classList.remove('hidden');
    }
}

async function updatePhoto() {
    const id = document.getElementById('edit-photo-id').value;
    const title = document.getElementById('edit-photo-title').value;
    const description = document.getElementById('edit-photo-description').value;

    try {
        const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });

        const data = await response.json();

        if (data.success) {
            alert('Photo updated successfully!');
            closeModal('edit-photo-modal');
            loadPhotos();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to update photo');
    }
}

async function deletePhoto(id) {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            alert('Photo deleted successfully!');
            loadPhotos();
        } else {
            alert(data.error.message);
        }
    } catch (error) {
        alert('Failed to delete photo');
    }
}

// Modal controls
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
    }
}
