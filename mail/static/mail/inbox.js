document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Handle form submission
  document.querySelector('#compose-form').addEventListener('submit', handleSubmission)

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // reset form errors before re-evaluation
  document.getElementById('recipients-invalid-message').hidden = true
  document.getElementById('subject-invalid-message').hidden = true
  document.querySelector('#compose-recipients').classList.remove('is-invalid')
  document.querySelector('#compose-subject').classList.remove('is-invalid')

  // Re-enable composition fields in case "reply" has disabled them
  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-subject').disabled = false;
}


function load_mailbox(mailbox) { 
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 id="inbox-name">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  getEmails(mailbox)
}


// Sends email on form submission
function handleSubmission() {
  event.preventDefault()
  let recipients = document.querySelector('#compose-recipients').value 
  let subject = document.querySelector('#compose-subject').value
  let body = document.querySelector('#compose-body').value

  // reset form errors before re-evaluation
  document.getElementById('recipients-invalid-message').hidden = true
  document.getElementById('subject-invalid-message').hidden = true
  document.querySelector('#compose-recipients').classList.remove('is-invalid')
  document.querySelector('#compose-subject').classList.remove('is-invalid')

  if (recipients && subject) {

    let emailDetails = { recipients, subject, body } 
    
    console.log(emailDetails)
    sendEmail(emailDetails)
  } else {
    if (!recipients) {
      document.getElementById('recipients-invalid-message').hidden = false
      document.querySelector('#compose-recipients').classList.add('is-invalid')
    }

    if (!subject) {
      document.getElementById('subject-invalid-message').hidden = false
      document.querySelector('#compose-subject').classList.add('is-invalid')
    }
  }
}


function sendEmail(emailDetails) {
  console.log('sending email...')
  fetch('emails', {
    method: 'POST',
    body: JSON.stringify(emailDetails)
  })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);

        // TODO - response handling
        // if response is 201 = Success
        // if response is 400 = fail
    })
    .then(() => {
      load_mailbox('sent')  
    })
}


// Gets all emails for user 
function getEmails(mailbox) {
  // Clear out any existing inbox items before creating new ones
  let inboxItems = document.querySelectorAll('.inbox-item')
  if (inboxItems.length > 0) {
    inboxItems.forEach(inboxItem => {
      inboxItem.remove()
    })
  }

  // Create new inbox items, if any exist
  fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);
        if (emails.length > 0) {
          emails.forEach((email) => {
            createInboxItem(email)
            if (mailbox == 'archive') {
              document.getElementById(`${email.id}`).addEventListener('click', (e) => handleUnarchive(e))
            } else if (mailbox == "inbox") {
              document.getElementById(`${email.id}`).addEventListener('click', (e) => handleArchive(e))
            } else {
              // only archive and inbox mailboxes should have the "close" button
              document.getElementById(`${email.id}`).remove()
            }
          })
        } else {
          displayNoEmails()
        }
    });
}


function createInboxItem(emailDetails) {
  const inboxItem = document.createElement('div');
  inboxItem.classList.add('inbox-item')
  inboxItem.id = `inbox-item-${emailDetails.id}`
  let buttonText;

  if (emailDetails.read == true) {
    inboxItem.classList.add('read')
    buttonText = 'Mark Unread'
  } else {
    inboxItem.classList.add('unread')
    buttonText = 'Mark Read'
  }
  inboxItem.addEventListener('click', () => getEmail(emailDetails.id))
  inboxItem.addEventListener('click', () => readAction(emailDetails.id))

  inboxItem.innerHTML = `
    <div class="row-md-12">
        <div class="col-md-12">
            <div class="row">
                <div class="col-sm-7">
                    <h4>${emailDetails.subject}</h4>
                </div>
                <div class="col-sm-4 text-right">
                    <i>${emailDetails.timestamp}</i>
                </div>
                <div class="col-sm-1 text-right text-align-right">
                    <div id="${emailDetails.id}" class="close-button"> X </div>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-5">
                    <p>To: ${emailDetails.recipients}</p>
                </div>
                <div class="col-sm-5">
                    <p>From: ${emailDetails.sender}</p>
                </div>
                <div class="col-sm-2">
                  <button id="${emailDetails.id}" class="btn btn-sm btn-outline-primary read-button">${buttonText}</button>
                </div>
            </div>
        </div>
    </div>
  `;

  document.querySelector('#emails-view').append(inboxItem);
  document.querySelector(`button[id='${emailDetails.id}']`).addEventListener('click', (e) => handleRead(e))
}


function handleArchive(e) {
  console.log(e)
  e.stopPropagation();
  e.preventDefault();
  archiveAction(e.srcElement.id, 'True')
}


function handleUnarchive(e) {
  console.log(e)
  e.stopPropagation();
  e.preventDefault();
  archiveAction(e.srcElement.id, 'False')
}


function archiveAction(email_id, archived) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({archived})
  })
    .then(() => {
      getEmails(document.getElementById('inbox-name').innerText.toLowerCase())
    })
}


function displayNoEmails() {
  const message = document.createElement('div');
  message.innerHTML = `
    <div class="row-md-12 no-items">
        <div class="col-md-12">
          You have no Emails yet.
        </div>
    </div>
  `;

  document.querySelector('#emails-view').append(message);
}


function getEmail(email_id) {
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#emails-view').style.display = 'none'
      let emailView = document.querySelector('#email-view')
      emailView.style.display = 'block'

      // let emailContent = document.createElement('div')
      emailView.innerHTML = `
      <div id="email-view" style="display: block;">
          <div class="row">
            <div id="email-subject" class="col-md-12">
                <h4 style="margin: 0; padding: 5px;">${email.subject}</h4>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-2 label">
                From: 
            </div>
            <div id="email-sender" class="col-md-10 value">
                ${email.sender}
            </div>
          </div>
          <div class="row">
            <div class="col-sm-2 label">
                To: 
            </div>
            <div id="email-to-value value" class="col-md-10 value">
                ${email.recipients}
            </div>
          </div>
          <div class="row">
            <div class="col-sm-2 label">
                Date Sent: 
            </div>
            <div id="email-to-value value" class="col-md-10 value">
                <i>${email.timestamp}</i>
            </div>
          </div>
          <div class="row">
            <div id="body-value" class="col-sm-12 value">
                <div class="body">${email.body}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
                <button id="reply-button" class="btn btn-sm btn-outline-primary" >Reply</button>
            </div>
          </div>
      </div>`

      document.getElementById('reply-button').addEventListener('click', () => handleReply(email))      
    });
}


function handleRead(e) {
  console.log(e)
  e.stopPropagation();
  e.preventDefault();

  if (e.srcElement.innerText == "Mark Read") {
    readAction(e.srcElement.id, true)
    document.querySelector(`button[id='${e.srcElement.id}']`).innerText = 'Mark Unread'
    document.getElementById(`inbox-item-${e.srcElement.id}`).className = 'inbox-item read'
  } else {
    readAction(e.srcElement.id, false)
    document.querySelector(`button[id='${e.srcElement.id}']`).innerText = 'Mark Read'
    document.getElementById(`inbox-item-${e.srcElement.id}`).className = 'inbox-item unread'
  }
}


function readAction(email_id, read=true) {  
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({read})
  })
}


function handleReply(replyEmail) {
  compose_email()

  document.querySelector('#compose-recipients').value = replyEmail.sender;
  document.querySelector('#compose-recipients').disabled = true

  document.querySelector('#compose-subject').value = `Re: ${replyEmail.subject}`;
  document.querySelector('#compose-subject').disabled = true

  document.querySelector('#compose-body').value = `On ${replyEmail.timestamp} ${replyEmail.sender} wrote: ${replyEmail.body}`;
}
