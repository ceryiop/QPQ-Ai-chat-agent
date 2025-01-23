const SVG_Thumb = `<svg width="24px" height="24px" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="currentColor"></path></svg>`

export const DisableInputExtension = {
  name: 'DisableInput',
  type: 'effect',
  match: ({ trace }) =>
    trace.type === 'ext_disableInput' ||
    trace.payload.name === 'ext_disableInput',
  effect: ({ trace }) => {
    const { isDisabled } = trace.payload

    function disableInput() {
      const chatDiv = document.getElementById('voiceflow-chat')

      if (chatDiv) {
        const shadowRoot = chatDiv.shadowRoot
        if (shadowRoot) {
          const chatInput = shadowRoot.querySelector('.vfrc-chat-input')
          const textarea = shadowRoot.querySelector(
            'textarea[id^="vf-chat-input--"]'
          )
          const button = shadowRoot.querySelector('.vfrc-chat-input--button')

          if (chatInput && textarea && button) {
            // Add a style tag if it doesn't exist
            let styleTag = shadowRoot.querySelector('#vf-disable-input-style')
            if (!styleTag) {
              styleTag = document.createElement('style')
              styleTag.id = 'vf-disable-input-style'
              styleTag.textContent = `
                .vf-no-border, .vf-no-border * {
                  border: none !important;
                }
                .vf-hide-button {
                  display: none !important;
                }
              `
              shadowRoot.appendChild(styleTag)
            }

            function updateInputState() {
              textarea.disabled = isDisabled
              if (!isDisabled) {
                textarea.placeholder = 'Message...'
                chatInput.classList.remove('vf-no-border')
                button.classList.remove('vf-hide-button')
                // Restore original value getter/setter
                Object.defineProperty(
                  textarea,
                  'value',
                  originalValueDescriptor
                )
              } else {
                textarea.placeholder = ''
                chatInput.classList.add('vf-no-border')
                button.classList.add('vf-hide-button')
                Object.defineProperty(textarea, 'value', {
                  get: function () {
                    return ''
                  },
                  configurable: true,
                })
              }

              // Trigger events to update component state
              textarea.dispatchEvent(
                new Event('input', { bubbles: true, cancelable: true })
              )
              textarea.dispatchEvent(
                new Event('change', { bubbles: true, cancelable: true })
              )
            }

            // Store original value descriptor
            const originalValueDescriptor = Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              'value'
            )

            // Initial update
            updateInputState()
          } else {
            console.error('Chat input, textarea, or button not found')
          }
        } else {
          console.error('Shadow root not found')
        }
      } else {
        console.error('Chat div not found')
      }
    }

    disableInput()
  },
}

export const FormExtension = {
  name: 'Forms',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_form' || trace.payload.name === 'ext_form',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form')
    
    formContainer.innerHTML = `
      <style>
        form {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 300px;
          margin: 0 auto;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          color: #333;
        }
        input[type="text"], input[type="email"], input[type="tel"] {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 20px;
          box-sizing: border-box;
          font-size: 14px;
        }
        .submit {
          background: linear-gradient(135deg, #8A2BE2, #6B4EFF);
          color: white;
          padding: 10px;
          border: none;
          border-radius: 20px;
          width: 100%;
          cursor: pointer;
          font-size: 16px;
          transition: opacity 0.3s;
        }
        .submit:hover {
          opacity: 0.9;
        }
      </style>
      
      <label for="name">Name</label>
      <input type="text" id="name" name="name" required>
      
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required>
      
      <label for="phone">Phone Number</label>
      <input type="tel" id="phone" name="phone" required>
      
      <button type="submit" class="submit">Submit</button>
    `
    
    formContainer.addEventListener('submit', function (event) {
      event.preventDefault()
      
      const name = formContainer.querySelector('#name')
      const email = formContainer.querySelector('#email')
      const phone = formContainer.querySelector('#phone')
      
      if (!name.checkValidity() || !email.checkValidity() || !phone.checkValidity()) {
        return
      }
      
      formContainer.querySelector('.submit').remove()
      
      window.voiceflow.chat.interact({
        type: 'complete',
        payload: { name: name.value, email: email.value, phone: phone.value },
      })
    })
    
    element.appendChild(formContainer)
  },
}

export const MapExtension = {
  name: 'Maps',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_map' || trace.payload.name === 'ext_map',
  render: ({ trace, element }) => {
    const GoogleMap = document.createElement('iframe')
    const { apiKey, origin, destination, zoom, height, width } = trace.payload

    GoogleMap.width = width || '240'
    GoogleMap.height = height || '240'
    GoogleMap.style.border = '0'
    GoogleMap.loading = 'lazy'
    GoogleMap.allowFullscreen = true
    GoogleMap.src = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}&zoom=${zoom}`

    element.appendChild(GoogleMap)
  },
}

export const VideoExtension = {
  name: 'Video',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_video' || trace.payload.name === 'ext_video',
  render: ({ trace, element }) => {
    const videoElement = document.createElement('video')
    const { videoURL, autoplay, controls } = trace.payload

    videoElement.width = 240
    videoElement.src = videoURL

    if (autoplay) {
      videoElement.setAttribute('autoplay', '')
    }
    if (controls) {
      videoElement.setAttribute('controls', '')
    }

    videoElement.addEventListener('ended', function () {
      window.voiceflow.chat.interact({ type: 'complete' })
    })
    element.appendChild(videoElement)
  },
}

export const TimerExtension = {
  name: 'Timer',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_timer' || trace.payload.name === 'ext_timer',
  render: ({ trace, element }) => {
    const { duration } = trace.payload || 5
    let timeLeft = duration

    const timerContainer = document.createElement('div')
    timerContainer.innerHTML = `<p>Time left: <span id="time">${timeLeft}</span></p>`

    const countdown = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(countdown)
        window.voiceflow.chat.interact({ type: 'complete' })
      } else {
        timeLeft -= 1
        timerContainer.querySelector('#time').textContent = timeLeft
      }
    }, 1000)

    element.appendChild(timerContainer)
  },
}

export const FileUploadExtension = {
  name: 'FileUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_fileUpload' || trace.payload.name === 'ext_fileUpload',
  render: ({ trace, element }) => {
    const fileUploadContainer = document.createElement('div')
    fileUploadContainer.innerHTML = `
      <style>
        .my-file-upload {
          border: 2px dashed rgba(46, 110, 225, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
      </style>
      <div class='my-file-upload'>Drag and drop a file here or click to upload</div>
      <input type='file' style='display: none;'>
    `

    const fileInput = fileUploadContainer.querySelector('input[type=file]')
    const fileUploadBox = fileUploadContainer.querySelector('.my-file-upload')

    fileUploadBox.addEventListener('click', function () {
      fileInput.click()
    })

    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0]
      console.log('File selected:', file)

      fileUploadContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif" alt="Upload" width="50" height="50">`

      var data = new FormData()
      data.append('file', file)

      fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: data,
      })
        .then((response) => {
          if (response.ok) {
            return response.json()
          } else {
            throw new Error('Upload failed: ' + response.statusText)
          }
        })
        .then((result) => {
          fileUploadContainer.innerHTML =
            '<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">'
          console.log('File uploaded:', result.data.url)
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              file: result.data.url.replace(
                'https://tmpfiles.org/',
                'https://tmpfiles.org/dl/'
              ),
            },
          })
        })
        .catch((error) => {
          console.error(error)
          fileUploadContainer.innerHTML = '<div>Error during upload</div>'
        })
    })

    element.appendChild(fileUploadContainer)
  },
}

export const KBUploadExtension = {
  name: 'KBUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_KBUpload' || trace.payload.name === 'ext_KBUpload',
  render: ({ trace, element }) => {
    const apiKey = trace.payload.apiKey || null
    const maxChunkSize = trace.payload.maxChunkSize || 1000
    const tags = `tags=${JSON.stringify(trace.payload.tags)}&` || ''
    const overwrite = trace.payload.overwrite || false

    if (apiKey) {
      const kbfileUploadContainer = document.createElement('div')
      kbfileUploadContainer.innerHTML = `
      <style>
        .my-file-upload {
          border: 2px dashed rgba(46, 110, 225, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
        }
      </style>
      <div class='my-file-upload'>Drag and drop a file here or click to upload</div>
      <input type='file' accept='.txt,.text,.pdf,.docx' style='display: none;'>
    `

      const fileInput = kbfileUploadContainer.querySelector('input[type=file]')
      const fileUploadBox =
        kbfileUploadContainer.querySelector('.my-file-upload')

      fileUploadBox.addEventListener('click', function () {
        fileInput.click()
      })

      fileInput.addEventListener('change', function () {
        const file = fileInput.files[0]

        kbfileUploadContainer.innerHTML = `<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/upload/upload.gif" alt="Upload" width="50" height="50">`

        const formData = new FormData()
        formData.append('file', file)

        fetch(
          `https://api.voiceflow.com/v3alpha/knowledge-base/docs/upload?${tags}overwrite=${overwrite}&maxChunkSize=${maxChunkSize}`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              Authorization: apiKey,
            },
            body: formData,
          }
        )
          .then((response) => {
            if (response.ok) {
              return response.json()
            } else {
              throw new Error('Upload failed: ' + response.statusText)
              window.voiceflow.chat.interact({
                type: 'error',
                payload: {
                  id: 0,
                },
              })
            }
          })
          .then((result) => {
            kbfileUploadContainer.innerHTML =
              '<img src="https://s3.amazonaws.com/com.voiceflow.studio/share/check/check.gif" alt="Done" width="50" height="50">'
            window.voiceflow.chat.interact({
              type: 'complete',
              payload: {
                id: result.data.documentID || 0,
              },
            })
          })
          .catch((error) => {
            console.error(error)
            kbfileUploadContainer.innerHTML = '<div>Error during upload</div>'
          })
      })
      element.appendChild(kbfileUploadContainer)
    }
  },
}

export const DateExtension = {
  name: 'Date',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_date' || trace.payload.name === 'ext_date',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form')

    // Get current date
    let currentDate = new Date()
    let minDate = new Date()
    minDate.setMonth(currentDate.getMonth() - 1)
    let maxDate = new Date()
    maxDate.setMonth(currentDate.getMonth() + 2)

    // Convert to ISO string and remove time part
    let minDateString = minDate.toISOString().slice(0, 10)
    let maxDateString = maxDate.toISOString().slice(0, 10)

    formContainer.innerHTML = `
      <style>
        label {
          font-size: 0.8em;
          color: #888;
        }
        .meeting input {
          background: transparent;
          border: none;
          padding: 2px;
          border-bottom: 0.5px solid rgba(255, 0, 0, 0.5);
          font: normal 14px sans-serif;
          outline: none;
          margin: 5px 0;
        }
        .meeting input:focus {
          outline: none;
        }
        .invalid {
          border-color: red;
        }
        .submit {
          background: linear-gradient(to right, #e12e2e, #f12e2e);
          border: none;
          color: white;
          padding: 10px;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
          opacity: 0.3;
        }
        .submit:enabled {
          opacity: 1;
        }
      </style>
      <label for="date">Select your date</label><br>
      <div class="meeting">
        <input type="text" id="meeting" name="meeting" placeholder="YYYY-MM-DD" pattern="\\d{4}-\\d{2}-\\d{2}" required />
      </div><br>
      <input type="submit" id="submit" class="submit" value="Submit" disabled="disabled">
    `

    const submitButton = formContainer.querySelector('#submit')
    const dateInput = formContainer.querySelector('#meeting')

    // Set min and max attributes
    dateInput.setAttribute('min', minDateString)
    dateInput.setAttribute('max', maxDateString)

    // Function to validate date
    function validateDate(input) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(input.value)) return false
      
      const date = new Date(input.value)
      return date >= new Date(input.min) && date <= new Date(input.max)
    }

    dateInput.addEventListener('input', function () {
      if (validateDate(this)) {
        submitButton.disabled = false
        this.classList.remove('invalid')
      } else {
        submitButton.disabled = true
        this.classList.add('invalid')
      }
    })

    formContainer.addEventListener('submit', function (event) {
      event.preventDefault()

      const date = dateInput.value
      console.log(date)

      formContainer.querySelector('.submit').remove()

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: { date: date },
      })
    })

    element.appendChild(formContainer)

    // If native date input is supported, use it
    if (dateInput.type === 'text') {
      // Fallback to flatpickr if native date input is not supported
      import('https://cdn.jsdelivr.net/npm/flatpickr').then((flatpickr) => {
        flatpickr.default(dateInput, {
          dateFormat: "Y-m-d",
          minDate: minDateString,
          maxDate: maxDateString,
          onChange: function(selectedDates, dateStr, instance) {
            dateInput.value = dateStr
            submitButton.disabled = false
          }
        })
      })
    }
  },
}

export const ConfettiExtension = {
  name: 'Confetti',
  type: 'effect',
  match: ({ trace }) => 
    trace.type === 'ext_confetti' || trace.payload?.name === 'ext_confetti',
  effect: ({ context }) => {
    const confetti = window.confetti;
    return Promise.all([
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff1493', '#00ffff', '#ff4500'],
        zIndex: 9999 // Ensure above chat
      }),
      confetti({
        particleCount: 150,
        spread: 100,
        angle: 60,
        origin: { x: 0.25, y: 0.6 }
      }),
      confetti({
        particleCount: 150,
        spread: 100,
        angle: 120,
        origin: { x: 0.75, y: 0.6 }
      })
    ]).then(context.done)
  }
}

export const FeedbackExtension = {
  name: 'Feedback',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_feedback' || trace.payload.name === 'ext_feedback',
  render: ({ trace, element }) => {
    const feedbackContainer = document.createElement('div');

    feedbackContainer.innerHTML = `
      <style>
        .feedback-container {
          background-color: #ffffff;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          box-sizing: border-box;
          font-family: sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .feedback-title {
          font-size: 16px; /* Increased font size */
          font-weight: bold; /* Match submit button font weight */
          margin-bottom: 12px;
          color: #333;
          text-align: center; /* Center align text */
        }
        .star-rating {
          font-size: 24px; /* Increased star size */
          color: #e0e0e0;
          margin-bottom: 12px;
          justify-content: center; /* Center align stars */
          display: flex;
        }
        .star-rating .star {
          display: inline-block;
          margin: 0 8px; /* Add spacing between stars */
        }
        .star-rating .star.active {
          color: #ffd700;
        }
        textarea {
          width: 100%;
          padding: 8px;
          margin: 8px 0;
          border: 1px solid #e0e0e0; /* Set initial border color to light purple */
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
          resize: none; /* Remove scrollbar */
          height: 60px; /* Set fixed height */
          font-family: inherit; /* Inherit font from container */
        }
        textarea:hover {
          border-color: #6B4EFF; /* Change border color on hover */
        }
        .submit-btn {
          background-color: linear-gradient(135deg, #6B4EFF, #8A2BE2);
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold; /* Match title font weight */
          width: 100%;
          margin-top: 8px;
          transition: background 0.3s ease;
        }
      </style>
      <div class="feedback-container">
        <div class="feedback-title">Please give your feedback on our customer service:</div>
        <div class="star-rating" id="starRating">
          <span class="star" data-value="1">★</span>
          <span class="star" data-value="2">★</span>
          <span class="star" data-value="3">★</span>
          <span class="star" data-value="4">★</span>
          <span class="star" data-value="5">★</span>
        </div>
        <textarea id="feedbackText" placeholder="Share your experience with us..."></textarea>
        <button class="submit-btn" id="submitFeedback">Submit Feedback</button>
      </div>
    `;

    let selectedRating = 0;

    const starRating = feedbackContainer.querySelector('#starRating');
    const stars = starRating.querySelectorAll('.star');
    const feedbackText = feedbackContainer.querySelector('#feedbackText');
    const submitButton = feedbackContainer.querySelector('#submitFeedback');

    function updateStars(rating) {
      stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
      });
    }

    starRating.addEventListener('click', (event) => {
      if (event.target.classList.contains('star')) {
        selectedRating = parseInt(event.target.dataset.value);
        updateStars(selectedRating);
      }
    });

    starRating.addEventListener('mouseover', (event) => {
      if (event.target.classList.contains('star')) {
        updateStars(parseInt(event.target.dataset.value));
      }
    });

    starRating.addEventListener('mouseout', () => {
      updateStars(selectedRating);
    });

    submitButton.addEventListener('click', () => {
      if (selectedRating === 0) {
        alert('Please select a rating before submitting.');
        return;
      }

      const feedback = {
        rating: selectedRating,
        comment: feedbackText.value.trim(),
      };

      console.log('Feedback submitted:', feedback);

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: feedback,
      });

      feedbackContainer.innerHTML = '<p>Thank you for your feedback!</p>';
    });

    element.appendChild(feedbackContainer);
  },
}

export const MatrixEffectExtension = {
  name: 'MatrixEffect',
  type: 'effect',
  match: ({ trace }) =>
    trace.type === 'ext_matrix' || trace.payload.name === 'ext_matrix',
  effect: ({ trace }) => {
    let canvas = document.getElementById('matrix-canvas');

    // If canvas does not exist, create it
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'matrix-canvas';
      canvas.style.position = 'fixed';
      canvas.style.zIndex = '999';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';

    // Create an array to hold all characters with equal distribution
    const balancedAlphabet = [
      ...katakana.split(''),
      ...latin.split(''),
      ...nums.split(''),
    ];

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const rainDrops = Array(columns).fill(1);

    let animationId;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = balancedAlphabet[Math.floor(Math.random() * balancedAlphabet.length)];
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      draw();
    };

    // Stop any existing animation
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    // Start the animation
    animate();

    // Stop the animation after 10 seconds
    const stopAnimation = () => {
      cancelAnimationFrame(animationId);
      if (canvas) {
        canvas.remove();
      }
    };
    setTimeout(stopAnimation, 10000);

    // Return a cleanup function
    return () => {
      stopAnimation();
    };
  },
}

export const MultiSelectExtension = {
  name: 'MultiSelect',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_multiselect' || trace.payload.name === 'ext_multiselect',
  render: ({ trace, element }) => {
    const multiSelectContainer = document.createElement('div');

    multiSelectContainer.innerHTML = `
      <style>
        .multiselect-container {
          background-color: #ffffff;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          box-sizing: border-box;
          font-family: sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .multiselect-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #333;
          text-align: center;
        }
        .dropdown {
          position: relative;
          width: 100%;
          max-width: 400px;
        }
        .dropdown-button {
          background-color: #f0f0f0;
          color: #333; /* Dark gray text */
          padding: 8px 16px;
          border: 1px solid transparent; /* Initially invisible border */
          border-radius: 2px;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
          text-align: left;
          position: relative;
         transition: border-color 0.3s; /* Smooth transition for border color */
        }

        .dropdown-button:hover {
          border-color: #6B4EFF; /* Purple border on hover */
        }
        .dropdown-button::after {
          content: '▼';
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
        }
        .dropdown-list {
          display: none;
          position: absolute;
          background-color: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-top: 8px;
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
          border-radius: 4px;
          z-index: 10;
        }
        .dropdown-list.active {
          display: block;
        }
        .dropdown-item {
          padding: 8px 10px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          transition: background-color 0.3s;
        }
        .dropdown-item:hover {
          background-color: #f0f0f0;
        }
        .dropdown-item.selected {
          background-color: #6B4EFF;
          color: white;
        }
        .submit-btn {
          background-color: #6B4EFF;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          width: 100%;
          margin-top: 8px;
        }
      </style>
      <div class="multiselect-container">
        <div class="multiselect-title">Select your preferences:</div>
        <div class="dropdown">
          <button class="dropdown-button" id="dropdownButton">Select options</button>
          <div class="dropdown-list" id="dropdownList">
            <div class="dropdown-item" data-value="Option 1">Crunch</div>
            <div class="dropdown-item" data-value="Option 2">Sauce</div>
            <div class="dropdown-item" data-value="Option 3">Fruit</div>
            <div class="dropdown-item" data-value="Option 4">without</div>
          </div>
        </div>
        <button class="submit-btn" id="submitMultiSelect">Submit</button>
      </div>
    `;

    const dropdownButton = multiSelectContainer.querySelector('#dropdownButton');
    const dropdownList = multiSelectContainer.querySelector('#dropdownList');
    const dropdownItems = dropdownList.querySelectorAll('.dropdown-item');
    const submitButton = multiSelectContainer.querySelector('#submitMultiSelect');
    let selectedOptions = [];

    // Toggle dropdown visibility
    dropdownButton.addEventListener('click', () => {
      dropdownList.classList.toggle('active');
    });

    // Handle item selection (without checkboxes)
    dropdownItems.forEach((item) => {
      item.addEventListener('click', () => {
        const value = item.getAttribute('data-value');

        // Toggle selected state
        if (selectedOptions.includes(value)) {
          selectedOptions = selectedOptions.filter(opt => opt !== value);
          item.classList.remove('selected');
        } else {
          selectedOptions.push(value);
          item.classList.add('selected');
        }

        // Update dropdown button text
        dropdownButton.textContent = selectedOptions.length > 0 ? selectedOptions.join(', ') : 'Select options';
      });
    });

    // Capture selected options on submit
    submitButton.addEventListener('click', () => {
      if (selectedOptions.length === 0) {
        alert('Please select at least one option.');
        return;
      }

      const feedback = {
        selected: selectedOptions,
      };

      console.log('Multi-select submitted:', feedback);

      // Send data via Voiceflow
      window.voiceflow.chat.interact({
        type: 'complete',
        payload: feedback,
      });

      multiSelectContainer.innerHTML = '<p>Thank you for your selections!</p>';
    });

    element.appendChild(multiSelectContainer);
  },
}

export const DateTimeExtension = {
  name: 'DateTime',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_datetime' || trace.payload.name === 'ext_datetime',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form')

    // Get current date and set min/max dates for date picker
    let currentDate = new Date()
    let minDate = new Date()
    minDate.setMonth(currentDate.getMonth() - 1)
    let maxDate = new Date()
    maxDate.setMonth(currentDate.getMonth() + 2)

    // Convert to ISO string and remove time part
    let minDateString = minDate.toISOString().slice(0, 10)
    let maxDateString = maxDate.toISOString().slice(0, 10)

    formContainer.innerHTML = `
      <style>
        label {
          font-size: 0.8em;
          color: #888;
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          border: none;
          background: transparent;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
          outline: none;
          color: transparent;
          cursor: pointer;
          position: absolute;
          padding: 6px;
          font: normal 8px sans-serif;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
        }
        .meeting input {
          background: transparent;
          border: none;
          padding: 2px;
          border-bottom: 0.5px solid rgba(255, 0, 0, 0.5); /* Red color */
          font: normal 14px sans-serif;
          outline: none;
          margin: 5px 0;
          width: 100%;
          position: relative;
        }
        .meeting input:focus {
          outline: none;
        }
        .submit {
          background: linear-gradient(to right, #e12e2e, #f12e2e); /* Red gradient */
          border: none;
          color: white;
          padding: 10px;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
          opacity: 0.3;
        }
        .submit:enabled {
          opacity: 1; /* Make the button fully opaque when it's enabled */
        }
      </style>
      <label for="date">Select your date</label><br>
      <div class="meeting">
        <input type="date" id="meeting-date" name="meeting-date" value="" min="${minDateString}" max="${maxDateString}" />
      </div>
      <label for="time">Select your time</label><br>
      <div class="meeting">
        <input type="time" id="meeting-time" name="meeting-time" step="900" value="00:00" />
      </div><br>
      <input type="submit" id="submit" class="submit" value="Submit" disabled="disabled">
    `

    const submitButton = formContainer.querySelector('#submit')
    const dateInput = formContainer.querySelector('#meeting-date')
    const timeInput = formContainer.querySelector('#meeting-time')

    // Enable submit button only when both date and time are selected
    function updateSubmitButton() {
      if (dateInput.value && timeInput.value) {
        submitButton.disabled = false
      } else {
        submitButton.disabled = true
      }
    }

    dateInput.addEventListener('input', updateSubmitButton)
    timeInput.addEventListener('input', updateSubmitButton)

    formContainer.addEventListener('submit', function (event) {
      event.preventDefault()
      const date = dateInput.value
      const time = timeInput.value

      // Combine date and time into a single dateTime string in ISO format
      const dateTime = `${date}T${time}:00`

      console.log(`Selected dateTime: ${dateTime}`)

      // Send the dateTie as one payload in the required format
      formContainer.querySelector('.submit').remove()
      window.voiceflow.chat.interact({
        type: 'complete',
        payload: { dateTime: dateTime },
      })
    })

    element.appendChild(formContainer)

    // Check if the date input is supported
    if (dateInput.type !== 'date') {
      // If not supported (like on older iOS), load flatpickr as a fallback
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/flatpickr'
      script.onload = function() {
        flatpickr(dateInput, {
          dateFormat: "Y-m-d",
          minDate: minDateString,
          maxDate: maxDateString,
          onChange: updateSubmitButton
        })
      }
      document.head.appendChild(script)
    }
  },
}

export const MenuExtension = {
  name: 'MenuExtension',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_menu' || trace.payload.name === 'ext_menu',
  render: ({ trace, element }) => {
    const menuContainer = document.createElement('div');

    menuContainer.innerHTML = `
      <style>
        .menu-container {
          background-color: #ffffff;
          padding: 16px;
          border-radius: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 600px;
          box-sizing: border-box;
          font-family: sans-serif;
          text-align: center;
          display: grid;
          grid-template-areas: 
            "drinks desserts"
            "mainMenu mainMenu";
          grid-template-columns: 1fr 1fr;
          grid-gap: 10px;
        }
        .menu-option {
          position: relative;
          z-index: 1;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.4s ease;
        }
        .menu-option img {
          width: 100%;
          height: 100px; /* Adjust this height as needed */
          object-fit: cover;
        }
        .menu-option:hover {
          transform: scale(1.5); /* Slightly scale up on hover for effect */
          z-index: 10;
        }
        .drinks {
          grid-area: drinks;
        }
        .desserts {
          grid-area: desserts;
        }
        .mainMenu {
          grid-area: mainMenu;
        }
      </style>

      <div class="menu-container">
        <div class="menu-option drinks" id="drinksOption">
          <img src="https://i.ibb.co/7Rk6pyQ/drinks-2-2.jpg" alt="Drinks">
        </div>
        <div class="menu-option desserts" id="dessertsOption">
          <img src="https://i.ibb.co/0t3nvz8/dessert-1.jpg" alt="Desserts">
        </div>
        <div class="menu-option mainMenu" id="mainMenuOption">
          <img src="https://i.ibb.co/PYgYP4K/main-2-2.jpg" alt="Main Menu">
        </div>
      </div>
    `;

    // Add event listeners to handle image clicks
    const drinksOption = menuContainer.querySelector('#drinksOption');
    const dessertsOption = menuContainer.querySelector('#dessertsOption');
    const mainMenuOption = menuContainer.querySelector('#mainMenuOption');

    drinksOption.addEventListener('click', () => {
      console.log('Drinks option selected');
      window.voiceflow.chat.interact({
        type: 'complete',
        payload: { selected: 'drinks' },
      });
    });

    dessertsOption.addEventListener('click', () => {
      console.log('Desserts option selected');
      window.voiceflow.chat.interact({
        type: 'complete',
        payload: { selected: 'desserts' },
      });
    });

    mainMenuOption.addEventListener('click', () => {
      console.log('Main menu option selected');
      window.voiceflow.chat.interact({
        type: 'complete',
        payload: { selected: 'main_menu' },
      });
    });

    element.appendChild(menuContainer);
  },
}

export const TransportBookingExtension = {
    name: 'TransportBooking',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'ext_transport_booking' || trace.payload.name === 'ext_transport_booking',
    render: ({ trace, element }) => {
      const formContainer = document.createElement('div');
  
      formContainer.innerHTML = `
        <style>
          .transport-booking-form {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 300px;
            margin: 0 auto;
          }
          .transport-booking-form input[type="text"],
          .transport-booking-form input[type="date"],
          .transport-booking-form input[type="time"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 20px;
            box-sizing: border-box;
            font-size: 14px;
          }
          .passenger-dropdown {
            position: relative;
            cursor: pointer;
            margin-bottom: 20px;
          }
          .passenger-dropdown .dropdown-content {
            display: none;
            position: absolute;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1;
            width: 100%;
            margin-top: 5px;
          }
          .passenger-dropdown.open .dropdown-content {
            display: block;
          }
          .passenger-dropdown button {
            width: 100%;
            border-radius: 8px;
            padding: 10px;
            background: linear-gradient(to right, #00f, #0077ff);
            color: white;
            border: none;
            cursor: pointer;
          }
          .passenger-controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
          }
          .passenger-controls .count {
            width: 40px;
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 5px 0;
            font-size: 14px;
          }
          .passenger-controls button {
            width: 30px;
            height: 30px;
            border-radius: 5px;
            border: none;
            background: linear-gradient(to right, #0077ff, #00f);
            color: white;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .passenger-controls button:hover {
            opacity: 0.9;
          }
          .submit {
            background: linear-gradient(to right, #8A2BE2, #6B4EFF);
            color: white;
            padding: 10px;
            border: none;
            border-radius: 20px;
            width: 100%;
            cursor: pointer;
            font-size: 16px;
            transition: opacity 0.3s;
          }
          .submit:hover {
            opacity: 0.9;
          }
        </style>
  
        <form class="transport-booking-form">
          <input type="text" id="departure" name="departure" placeholder="Departure" required>
          <input type="text" id="destination" name="destination" placeholder="Destination" required>
  
          <div class="passenger-dropdown">
            <button type="button" id="passenger-toggle">Select Passengers</button>
            <div class="dropdown-content">
              <div class="passenger-controls" data-type="adult">
                <span>Adults</span>
                <button type="button" class="subtract-button">-</button>
                <input type="text" class="count adult-count" value="0" readonly>
                <button type="button" class="add-button">+</button>
              </div>
              <div class="passenger-controls" data-type="child">
                <span>Children</span>
                <button type="button" class="subtract-button">-</button>
                <input type="text" class="count child-count" value="0" readonly>
                <button type="button" class="add-button">+</button>
              </div>
              <div class="passenger-controls" data-type="baby">
                <span>Babies</span>
                <button type="button" class="subtract-button">-</button>
                <input type="text" class="count baby-count" value="0" readonly>
                <button type="button" class="add-button">+</button>
              </div>
            </div>
          </div>
  
          <input type="date" id="date" name="date" required>
          <input type="time" id="time" name="time" required>
  
          <button type="submit" class="submit">Book Now</button>
        </form>
      `;
  
      const form = formContainer.querySelector('.transport-booking-form');
      const passengerToggle = form.querySelector('#passenger-toggle');
      const passengerDropdown = form.querySelector('.passenger-dropdown');
  
      passengerToggle.addEventListener('click', () => {
        passengerDropdown.classList.toggle('open');
      });
  
      const updateCount = (type, increment) => {
        const countElement = form.querySelector(`.${type}-count`);
        let currentCount = parseInt(countElement.value);
        if (increment) {
          currentCount += 1;
        } else if (currentCount > 0) {
          currentCount -= 1;
        }
        countElement.value = currentCount;
        console.log(`${type} count updated to: ${currentCount}`); // Debug log
      };
  
      passengerDropdown.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
  
        const control = button.closest('.passenger-controls');
        if (!control) return;
  
        const type = control.getAttribute('data-type');
        console.log('Button clicked:', button.className, 'for type:', type); // Debug log
  
        if (button.classList.contains('add-button')) {
          updateCount(type, true);
        } else if (button.classList.contains('subtract-button')) {
          updateCount(type, false);
        }
      });
  
      form.addEventListener('submit', (event) => {
        event.preventDefault();
  
        const formData = new FormData(form);
        const bookingData = {
          departure: formData.get('departure'),
          destination: formData.get('destination'),
          date: formData.get('date'),
          time: formData.get('time'),
          adults: parseInt(form.querySelector('.adult-count').value),
          children: parseInt(form.querySelector('.child-count').value),
          babies: parseInt(form.querySelector('.baby-count').value),
        };
  
        if (!bookingData.departure || !bookingData.destination || !bookingData.date || !bookingData.time || 
            (bookingData.adults + bookingData.children + bookingData.babies === 0)) {
          alert('Please fill in all the required fields and select at least one passenger.');
          return;
        }
  
        // Constructing the payload
        const payload = {
          booking: {
            destination: bookingData.destination,
            date: bookingData.date,
            time: bookingData.time,
            adults: bookingData.adults,
            children: bookingData.children,
            babies: bookingData.babies,
          },
        };
  
        console.log('Booking data:', payload); // Debug log
  
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: payload,
        });
      });
  
      element.appendChild(formContainer);
    },
}
  
  export const DateTimeGuestExtension = {
    name: 'DateTimeGuest',
    type: 'response',
    match: ({ trace }) => trace.type === 'ext_datetime_guest' || trace.payload.name === 'ext_datetime_guest',
    render: ({ trace, element }) => {
        const formContainer = document.createElement('form');

        // Current date for min/max inputs
        const currentDate = new Date();
        const minDate = currentDate.toISOString().slice(0, 10); // Min date is today

        formContainer.innerHTML = `
<style>
  /* Styles for your form elements */
  form {
    font-family: Arial, sans-serif;
    max-width: 400px;
    margin: 0 auto;
  }
  label {
    display: block;
    margin-top: 10px;
    font-size: 1em;
    color: #333;
  }
  input[type="date"],
  input[type="number"] {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 0.3px solid #ffbe60; /* Custom border color */
    border-radius: 20px; /* Rounded corners */
    transition: border-color 0.3s; /* Smooth transition for border color */
  }
  input[type="date"]:focus,
  input[type="number"]:focus {
    border-color: lightgoldenrod; /* Darker gold on focus */
  }
  input[type="submit"] {
    margin-top: 15px;
    background-color: #f4b151; /* Custom color for submit button */
    color: white;
    padding: 10px;
    border: none;
    border-radius: 20px; /* Rounded corners for submit button */
    cursor: pointer;
    width: 100%;
    transition: background-color 0.3s; /* Smooth transition for background color */
  }
  input[type="submit"]:hover {
    background-color: #AB7221; /* Change background on hover */
  }
  .confirmation-message {
    margin-top: 15px;
    color: #333; /* Normal color, not bold */
    text-align: center;
    display: none; /* Hide by default */
    padding: 10px; /* Increased padding */
  }
</style>

<label for="arrival-date">Arrival Date</label>
<input type="date" id="arrival-date" name="arrival-date" min="${minDate}" required>

<label for="departure-date">Departure Date</label>
<input type="date" id="departure-date" name="departure-date" min="${minDate}" required>

<label for="adults">Number of Adults</label>
<input type="number" id="adults" name="adults" min="1" value="1" required>

<label for="children">Number of Children</label>
<input type="number" id="children" name="children" min="0" value="0">

<input type="submit" id="submit" class="submit" value="Submit">
<div class="confirmation-message" id="confirmation-message">Your submission was successful!</div>
        `;

        const arrivalDateInput = formContainer.querySelector('#arrival-date');
        const departureDateInput = formContainer.querySelector('#departure-date');
        const submitButton = formContainer.querySelector('#submit');
        const confirmationMessage = formContainer.querySelector('#confirmation-message');

        arrivalDateInput.addEventListener('change', function () {
            const arrivalDate = new Date(arrivalDateInput.value);
            const departureDate = new Date(departureDateInput.value);
            const departureDateMin = new Date(arrivalDate);
            departureDateMin.setDate(arrivalDate.getDate() + 1); // Ensure departure is at least one day after arrival
            departureDateInput.min = departureDateMin.toISOString().slice(0, 10);

            // Highlight dates
            departureDateInput.classList.add('hovered');
        });

        departureDateInput.addEventListener('change', function () {
            const arrivalDate = new Date(arrivalDateInput.value);
            const departureDate = new Date(departureDateInput.value);
            const allDates = [];

            for (let d = arrivalDate; d <= departureDate; d.setDate(d.getDate() + 1)) {
                allDates.push(new Date(d));
            }

            allDates.forEach(date => {
                const formattedDate = date.toISOString().slice(0, 10);
                // You can add logic here to highlight or mark these dates in your UI if needed
            });
        });

        formContainer.addEventListener('submit', function (event) {
            event.preventDefault();

            const arrivalDate = arrivalDateInput.value;
            const departureDate = departureDateInput.value;
            const adults = formContainer.querySelector('#adults').value;
            const children = formContainer.querySelector('#children').value;

            // Log for debugging (optional)
            console.log(`Arrival Date: ${arrivalDate}`);
            console.log(`Departure Date: ${departureDate}`);
            console.log(`Adults: ${adults}`);
            console.log(`Children: ${children}`);

            // Send the input values as one payload
            window.voiceflow.chat.interact({
                type: 'complete',
                payload: { 
                    arrivalDate, 
                    departureDate, 
                    adults, 
                    children 
                },
            });

            // Disable the form inputs and hide the submit button
            formContainer.querySelectorAll('input').forEach(input => {
                input.disabled = true; // Disable all inputs
            });
            submitButton.style.display = 'none'; // Hide the submit button
            confirmationMessage.style.display = 'block'; // Show confirmation message
        });

        element.appendChild(formContainer);
    },
}

export const ContactFormExtension = {
  name: 'ContactForm',
  type: 'response',
  match: ({ trace }) =>
      trace.type === 'Custom_Form' || trace.payload.name === 'Custom_Form',
  render: ({ trace, element }) => {
      const formContainer = document.createElement('form');

      formContainer.innerHTML = `
    <style>
      label {
        font-size: 0.8em;
        color: #AB7221; /* Orange label color */
        display: block;
        margin-bottom: 3px; /* Reduced space under label */
      }
      input[type="text"], input[type="email"], input[type="tel"] {
        width: 90%; /* Shortened width */
        border: 0.2px solid #ffd966; /* Matching border color */
        border-radius: 20px; /* Rounded corners */
        background: transparent;
        margin-bottom: 10px; /* Reduced space between inputs */
        padding: 8px;
        color: #333; /* Dark text color */
        font-size: 1em;
        outline: none;
        display: block;
        margin-left: auto; /* Center align */
        margin-right: auto; /* Center align */
      }
      input[type="text"]:focus, input[type="email"]:focus, input[type="tel"]:focus {
        border-color: #AB7221;
        box-shadow: 0 0 5px rgba(171, 114, 33, 0.4); /* Subtle shadow effect */
      }
      .invalid {
        border-color: red;
      }
      .submit {
        background: #AB7221; /* Solid orange background */
        border: none;
        color: white;
        padding: 12px; /* Increased padding */
        border-radius: 20px; /* Rounded corners for submit button */
        width: 90%; /* Width of submit button */
        cursor: pointer;
        font-size: 1em;
        font-weight: bold;
        display: block;
        margin-left: auto; /* Center align */
        margin-right: auto; /* Center align */
        transition: background-color 0.3s; /* Smooth transition for background color */
      }
      .submit:hover {
        background: #915e1d; /* Slightly darker orange on hover */
      }
      .confirmation-message {
        margin-top: 15px;
        color: #333; /* Normal color */
        text-align: center;
        display: none; /* Hide by default */
        padding: 10px; /* Increased padding */
      }
    </style>

    <label for="name">Name</label>
    <input type="text" class="name" name="name" required>
    
    <label for="email">Email</label>
    <input type="email" class="email" name="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" title="Invalid email address">
    
    <label for="phone">Phone Number</label>
    <input type="tel" class="phone" name="phone">
    
    <input type="submit" class="submit" value="Submit">
    <div class="confirmation-message" id="confirmation-message">Your submission was successful!</div>
    `;

      const nameInput = formContainer.querySelector('.name');
      const emailInput = formContainer.querySelector('.email');
      const phoneInput = formContainer.querySelector('.phone');
      const confirmationMessage = formContainer.querySelector('#confirmation-message');

      formContainer.addEventListener('input', function () {
          if (nameInput.checkValidity()) nameInput.classList.remove('invalid');
          if (emailInput.checkValidity()) emailInput.classList.remove('invalid');
      });

      formContainer.addEventListener('submit', function (event) {
          event.preventDefault();

          if (
              !nameInput.checkValidity() ||
              !emailInput.checkValidity()
          ) {
              nameInput.classList.add('invalid');
              emailInput.classList.add('invalid');
              return;
          }

          // Disable the form inputs and hide the submit button
          formContainer.querySelectorAll('input').forEach(input => {
              input.disabled = true; // Disable all inputs
          });
          formContainer.querySelector('.submit').style.display = 'none'; // Hide the submit button

          // Send the input values as one payload
          window.voiceflow.chat.interact({
              type: 'complete',
              payload: { 
                  name: nameInput.value, 
                  email: emailInput.value, 
                  phone: phoneInput.value || "" // Allow empty phone value
              },
          });

          // Show the confirmation message
          confirmationMessage.style.display = 'block'; // Show confirmation message
      });

      element.appendChild(formContainer);
  },
}
