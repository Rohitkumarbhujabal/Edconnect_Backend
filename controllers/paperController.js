const { mongoose } = require("mongoose");
const Paper = require("./../models/Paper");
const asyncHandler = require("express-async-handler");


const getPapers = asyncHandler(async (req, res) => {
  if (!req?.params?.teacherId) {
    return res.status(400).json({ message: "Teacher ID Missing" });
  }
  const papers = await Paper.find({
    teacher: req.params.teacherId,
  })
    .select("-students")
    .exec();
  if (!papers) {
    return res.status(404).json({
      message: `No Paper(s) found`,
    });
  }
  res.json(papers);
});


const getPapersStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res.status(400).json({ message: "Student ID Missing" });
  }
  const papers = await Paper.aggregate([
    {
      $lookup: {
        from: "teachers",
        localField: "teacher",
        foreignField: "_id",
        as: "teacher",
      },
    },
    {
      $unwind: "$teacher",
    },
    {
      $project: {
        students: {
          $in: [new mongoose.Types.ObjectId(req.params.studentId), "$students"],
        },
        semester: 1,
        year: 1,
        paper: 1,
        "teacher.name": 1,
      },
    },
    {
      $match: { students: true },
    },
  ]);
  if (!papers) {
    return res.status(404).json({
      message: `No Paper(s) found`,
    });
  }
  res.json(papers);
});

const getAllPapers = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res.status(400).json({ message: "Student ID Missing" });
  }

  const papers = await Paper.aggregate([
    {
      $lookup: {
        from: "teachers",
        localField: "teacher",
        foreignField: "_id",
        as: "teacher",
      },
    },
    {
      $unwind: "$teacher",
    },
    {
      $project: {
        semester: 1,
        year: 1,
        paper: 1,
        "teacher.name": 1,
        students: 1,
        department: 1,
        joined: {
          $in: [new mongoose.Types.ObjectId(req.params.studentId), "$students"],
        },
      },
    },
  ]);
  if (!papers) {
    return res.status(404).json({
      message: `No Paper(s) found`,
    });
  }
  res.json(papers);
});


const getStudentsList = asyncHandler(async (req, res) => {
  if (!req?.params?.paperId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }

  const students = await Paper.findById(req.params.paperId)
    .select("students")
    .populate({ path: "students", select: "name" })
    .exec();
  if (!students?.students) {
    return res.status(400).json({ message: "No Students Found" });
  }
  res.json(students.students);
});

const getPaper = asyncHandler(async (req, res) => {
  if (!req?.params?.paperId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const paper = await Paper.findOne({
    _id: req.params.paperId,
  })
    .populate({ path: "teacher", select: "name" })
    .populate({ path: "students", select: "name" })
    .exec();
  if (!paper) {
    return res.status(404).json({
      message: `No Paper(s) found`,
    });
  }
  res.json(paper);
});

const addPaper = asyncHandler(async (req, res) => {
  const { department, semester, year, paper, students, teacher } = req.body;

  if (!department || !paper || !semester || !year || !students || !teacher) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Fields Missing" });
  }

  const duplicate = await Paper.findOne({
    department: req.body.department,
    paper: req.body.paper,
    students: req.body.students,
    teacher: req.body.teacher,
  })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Paper already exists" });
  }

  const PaperObj = {
    department,
    semester,
    paper,
    year,
    students,
    teacher,
  };

  const record = await Paper.create(PaperObj);

  if (record) {
    res.status(201).json({
      message: `New Paper ${req.body.paper} added `,
    });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

const updateStudents = asyncHandler(async (req, res) => {
  const { id, students } = req.body;


  if (!id || !students) {
    return res.status(400).json({ message: "All fields are required" });
  }


  const record = await Paper.findById(id).exec();

  if (!record) {
    return res.status(404).json({ message: "Paper doesn't exist" });
  }

  record.students = students;

  const save = await record.save();
  if (save) {
    res.json({ message: "Updated" });
  } else {
    res.json({ message: "Save Failed" });
  }
});

const deletePaper = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Paper ID required" });
  }

  const record = await Paper.findById(id).exec();

  if (!record) {
    return res.status(404).json({ message: "Paper not found" });
  }

  await record.deleteOne();

  res.json({ message: `${paper} deleted` });
});

module.exports = {
  addPaper,
  getAllPapers,
  getPapers,
  getPapersStudent,
  getStudentsList,
  getPaper,
  updateStudents,
  deletePaper,
};
