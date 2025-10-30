# Password Hashing Fix Guide

## Issue Description

The password hashing was inconsistent between different user creation methods:
- ✅ **Registration via `/auth/register`**: Passwords were properly hashed
- ❌ **Admin portal user creation**: Passwords were stored as plain text
- ❌ **Database seeding**: Passwords were stored as plain text

## Root Cause

The issue occurred because:

1. **`findByIdAndUpdate()` bypasses middleware**: The admin portal used `User.findByIdAndUpdate()` which doesn't trigger the pre-save middleware that hashes passwords.

2. **`insertMany()` bypasses middleware**: The database seeder used `User.insertMany()` which also bypasses the pre-save middleware.

3. **Pre-save middleware only runs on `save()`**: The password hashing middleware only executes when using `user.save()` or `new User().save()`.

## Fixes Applied

### 1. Fixed Admin Portal User Creation

**File**: `server/controllers/userController.js`

**Before** (using `findByIdAndUpdate`):
```javascript
const updateData = {}
if (password) updateData.passwordHash = password
const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
```

**After** (using `save()`):
```javascript
const user = await User.findById(userId)
if (password) user.passwordHash = password
await user.save() // This triggers pre-save middleware
```

### 2. Fixed Database Seeding

**File**: `server/seeders/demoData.js`

**Before** (using `insertMany`):
```javascript
const createdUsers = await User.insertMany(users)
```

**After** (using individual `save()` calls):
```javascript
const createdUsers = []
for (const userData of users) {
  const user = new User(userData)
  await user.save() // This triggers pre-save middleware
  createdUsers.push(user)
}
```

### 3. Created Password Fix Script

**File**: `fix-passwords.js`

This script identifies and fixes existing users with plain text passwords:
- Detects plain text passwords by attempting bcrypt comparison
- Hashes plain text passwords using the same bcrypt settings (12 rounds)
- Updates the database directly

### 4. Created Password Testing Script

**File**: `test-password-hashing.js`

This script verifies that password hashing is working correctly:
- Tests new user creation with password hashing
- Tests password comparison functionality
- Tests password updates
- Checks existing users for plain text passwords

## How to Fix Existing Data

### Step 1: Test Current State
```bash
npm run test-passwords
```

This will show you which users have plain text passwords.

### Step 2: Fix Plain Text Passwords
```bash
npm run fix-passwords
```

This will hash all plain text passwords in your database.

### Step 3: Verify Fix
```bash
npm run test-passwords
```

Run this again to confirm all passwords are now properly hashed.

### Step 4: Re-seed Database (Optional)
If you want to start fresh with properly hashed passwords:
```bash
npm run seed
```

The seeder now properly hashes passwords during creation.

## Verification

### Test Login Credentials

After running the fix, test these credentials:

**Admin**:
- Email: `admin@classroom.com`
- Password: `admin123`

**Teacher**:
- Email: `sarah.johnson@classroom.com`
- Password: `teacher123`

**Student**:
- Email: `alice.smith@student.com`
- Password: `student123`

### Manual Verification

1. **Check password format in database**:
   - Hashed passwords start with `$2a$12$` or `$2b$12$`
   - Plain text passwords are readable strings

2. **Test login functionality**:
   - Try logging in with the test credentials above
   - Login should work if passwords are properly hashed

3. **Test admin user creation**:
   - Create a new user via admin portal
   - Check that the password is hashed in the database

## Prevention

### For Future Development

1. **Always use `save()` for password updates**:
   ```javascript
   // ✅ Good - triggers middleware
   user.passwordHash = newPassword
   await user.save()
   
   // ❌ Bad - bypasses middleware
   await User.findByIdAndUpdate(id, { passwordHash: newPassword })
   ```

2. **Use individual saves for bulk operations with passwords**:
   ```javascript
   // ✅ Good - triggers middleware
   for (const userData of users) {
     const user = new User(userData)
     await user.save()
   }
   
   // ❌ Bad - bypasses middleware
   await User.insertMany(users)
   ```

3. **Test password hashing regularly**:
   ```bash
   npm run test-passwords
   ```

### Monitoring

- Run `npm run test-passwords` after any user-related changes
- Check that new users have properly hashed passwords
- Monitor login success rates to catch hashing issues early

## Security Notes

1. **Bcrypt Settings**: Using 12 rounds for strong security
2. **Salt Generation**: Each password gets a unique salt
3. **Consistent Hashing**: All passwords now use the same hashing method
4. **No Plain Text Storage**: All passwords are hashed before database storage

## Troubleshooting

### If login still fails after fix:

1. **Check password format**:
   ```bash
   npm run test-passwords
   ```

2. **Verify user exists**:
   - Check the database for the user email
   - Ensure the user is active (`isActive: true`)

3. **Test with known credentials**:
   - Use the demo credentials listed above
   - If those don't work, re-run the fix script

4. **Check bcrypt version**:
   - Ensure bcrypt version is consistent
   - Current version: `bcryptjs@^2.4.3`

### If admin portal user creation fails:

1. **Check server logs** for error messages
2. **Verify validation** is passing
3. **Test the endpoint** directly with API tools
4. **Check database** to see if user was created with hashed password

## Files Modified

- ✅ `server/controllers/userController.js` - Fixed admin user creation/update
- ✅ `server/seeders/demoData.js` - Fixed database seeding
- ✅ `fix-passwords.js` - Script to fix existing plain text passwords
- ✅ `test-password-hashing.js` - Script to test password hashing
- ✅ `package.json` - Added new scripts
- ✅ `PASSWORD-HASHING-FIX.md` - This documentation

## Summary

The password hashing inconsistency has been resolved by:
1. Ensuring all user creation/update operations use `save()` to trigger middleware
2. Fixing existing plain text passwords in the database
3. Providing tools to test and verify password hashing
4. Documenting best practices for future development

All passwords are now consistently hashed using bcrypt with 12 rounds, providing strong security for user authentication.