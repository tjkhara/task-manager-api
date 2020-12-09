const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// This is an attribute
// Virtual property - not stored in db
// Relationship between user and task
// First argument is the name of this property - tasks
// Second argument is an object
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// This removes data we dont want to share like password hash
// This method gets called when res.send() is called
userSchema.methods.toJSON = function () {
    const user = this
    // Get raw object with user data
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    
    return userObject

}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}


userSchema.statics.findByCredential = async (email, password) => {
    const user = await User.findOne({email})

    if(!user) {
        throw new Error('Unable to log in')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login.')
    }

    return user
}


// Hash plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User