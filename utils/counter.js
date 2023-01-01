const Counter = require('../models/Counter');

getSequenceNumber = async (seqName) => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: seqName },
      {
        $inc: { seq: 1 },
      },
      {
        new: true,
      }
    );
    if (!counter) {
      return null;
    }
    return counter.seq;
  } catch (error) {
    console.log(error);
  }
};

insertCounter = async (seqName) => {
  const counter = await Counter.create({
    _id: seqName,
    seq: 1,
  });
};

exports.generateId = async (seqName, modelName, doc) => {
  let seq = await getSequenceNumber(seqName);
  if (!seq) {
    await insertCounter(seqName);
    seq = 1;
  }
  const id =
    'COG' +
    '22' +
    modelName.toUpperCase().substr(0, 3) +
    (100000 + seq).toString();
  return id;
};
