const Student = require("./../models/Student");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const getStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const student = await Student.findById(req.params.id)
    .select("-password -_id -__v")
    .exec();
  if (!student) {
    return res.status(400).json({ message: "Student Not Found." });
  }
  res.json(student);
});

const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().select("-password").lean();
  if (!students?.length) {
    return res.status(400).json({ message: "No Students Found" });
  }
  res.json(students);
});

const createNewStudent = asyncHandler(async (req, res) => {
  const { name, course, email, username, password } = req.body;

  if (!name || !email || !course || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await Student.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const studentObj = {
    name,
    course,
    email,
    username,
    password: hashedPwd,
  };

  const student = await Student.create(studentObj);

  if (student) {
    res.status(201).json({ message: `New Student ${name} created` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

const updateStudent = asyncHandler(async (req, res) => {
  const { id, name, email, username, password } = req.body;


  if (!id || !name || !email || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(400).json({ message: "User not found" });
  }

  const duplicate = await Student.findOne({ username }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  student.name = name;
  student.email = email;
  student.username = username;

  if (password) {
    student.password = await bcrypt.hash(password, 10);
  }

  await student.save();

  res.json({ message: "User Updated" });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Student ID required" });
  }

  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  const result = await student.deleteOne();

  res.json({ message: `${result.username} deleted` });
});

module.exports = {
  getStudent,
  getAllStudents,
  createNewStudent,
  updateStudent,
  deleteStudent,
};
