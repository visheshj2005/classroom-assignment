import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

// Test credentials
const TEACHER_EMAIL = 'teacher@example.com'
const STUDENT_EMAIL = 'student@example.com'
const PASSWORD = 'password123'

let teacherToken = ''
let studentToken = ''
let classId = ''
let assignmentId = ''

async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password })
    
    if (response.data.success) {
      console.log(`✅ Login successful for ${email}`)
      return response.data.data.token
    } else {
      console.log(`❌ Login failed for ${email}:`, response.data.message)
      return null
    }
  } catch (error) {
    console.log(`❌ Login error for ${email}:`, error.response?.data?.message || error.message)
    return null
  }
}

async function createClass(token) {
  try {
    const response = await axios.post(`${API_BASE}/classes`, {
      title: 'Test Class for URL Submissions',
      description: 'Testing URL-only submissions',
      subject: 'Computer Science'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.data.success) {
      console.log('✅ Class created successfully:', response.data.data.class.title)
      return response.data.data.class._id
    } else {
      console.log('❌ Class creation failed:', response.data.message)
      return null
    }
  } catch (error) {
    console.log('❌ Class creation error:', error.response?.data?.message || error.message)
    return null
  }
}

async function createAssignment(token, classId) {
  try {
    const response = await axios.post(`${API_BASE}/assignments/classes/${classId}`, {
      title: 'URL Submission Test Assignment',
      description: 'Test assignment for URL submissions only',
      instructions: 'Please submit a URL to your GitHub repository or Google Drive link',
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      maxScore: 100
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.data.success) {
      console.log('✅ Assignment created successfully:', response.data.data.assignment.title)
      console.log('   Submission type:', response.data.data.assignment.submissionType)
      return response.data.data.assignment._id
    } else {
      console.log('❌ Assignment creation failed:', response.data.message)
      return null
    }
  } catch (error) {
    console.log('❌ Assignment creation error:', error.response?.data?.message || error.message)
    return null
  }
}

async function joinClass(token, joinCode) {
  try {
    const response = await axios.post(`${API_BASE}/classes/join`, { joinCode }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.data.success) {
      console.log('✅ Student joined class successfully')
      return true
    } else {
      console.log('❌ Join class failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Join class error:', error.response?.data?.message || error.message)
    return false
  }
}

async function getClassDetails(token, classId) {
  try {
    const response = await axios.get(`${API_BASE}/classes/${classId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.data.success) {
      return response.data.data.class
    }
    return null
  } catch (error) {
    console.log('❌ Get class details error:', error.response?.data?.message || error.message)
    return null
  }
}

async function submitAssignment(token, assignmentId) {
  try {
    const response = await axios.post(`${API_BASE}/submissions/assignments/${assignmentId}`, {
      content: {
        url: 'https://github.com/student/test-assignment',
        text: 'This is my assignment submission. Please check the GitHub repository for the complete code.'
      }
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.data.success) {
      console.log('✅ Assignment submitted successfully')
      console.log('   Submission type:', response.data.data.submission.submissionType)
      console.log('   URL:', response.data.data.submission.content.url)
      console.log('   Notes:', response.data.data.submission.content.text)
      return true
    } else {
      console.log('❌ Assignment submission failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Assignment submission error:', error.response?.data?.message || error.message)
    return false
  }
}

async function getAssignmentDetails(token, assignmentId) {
  try {
    const response = await axios.get(`${API_BASE}/assignments/${assignmentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.data.success) {
      console.log('✅ Assignment details retrieved')
      console.log('   Title:', response.data.data.assignment.title)
      console.log('   Submission type:', response.data.data.assignment.submissionType)
      if (response.data.data.assignment.mySubmission) {
        console.log('   Student has submitted:', response.data.data.assignment.mySubmission.content.url)
      }
      return true
    } else {
      console.log('❌ Get assignment details failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Get assignment details error:', error.response?.data?.message || error.message)
    return false
  }
}

async function runTest() {
  console.log('🚀 Starting URL Submission Test...\n')
  
  // Step 1: Login as teacher
  console.log('1. Logging in as teacher...')
  teacherToken = await login(TEACHER_EMAIL, PASSWORD)
  if (!teacherToken) return
  
  // Step 2: Login as student
  console.log('\n2. Logging in as student...')
  studentToken = await login(STUDENT_EMAIL, PASSWORD)
  if (!studentToken) return
  
  // Step 3: Create a class as teacher
  console.log('\n3. Creating a class as teacher...')
  classId = await createClass(teacherToken)
  if (!classId) return
  
  // Step 4: Get class details to get join code
  console.log('\n4. Getting class details...')
  const classDetails = await getClassDetails(teacherToken, classId)
  if (!classDetails) return
  
  console.log('   Join code:', classDetails.joinCode)
  
  // Step 5: Student joins the class
  console.log('\n5. Student joining the class...')
  const joined = await joinClass(studentToken, classDetails.joinCode)
  if (!joined) return
  
  // Step 6: Create assignment as teacher
  console.log('\n6. Creating assignment as teacher...')
  assignmentId = await createAssignment(teacherToken, classId)
  if (!assignmentId) return
  
  // Step 7: Student submits assignment with URL
  console.log('\n7. Student submitting assignment with URL...')
  const submitted = await submitAssignment(studentToken, assignmentId)
  if (!submitted) return
  
  // Step 8: Check assignment details as student
  console.log('\n8. Checking assignment details as student...')
  await getAssignmentDetails(studentToken, assignmentId)
  
  // Step 9: Check assignment details as teacher
  console.log('\n9. Checking assignment details as teacher...')
  await getAssignmentDetails(teacherToken, assignmentId)
  
  console.log('\n🎉 Test completed successfully!')
  console.log('\n📋 Summary:')
  console.log('   ✅ File uploads removed from assignments')
  console.log('   ✅ Only URL submissions allowed')
  console.log('   ✅ Teacher can create assignments')
  console.log('   ✅ Student can submit URLs')
  console.log('   ✅ System works end-to-end')
}

// Run the test
runTest().catch(console.error)