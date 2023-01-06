const Counter = require('../models/Counter');

getSequenceNumber = async (seqName) => {
  try {
    const counter = await Counter.findById({ _id: seqName });
    if (!counter) {
      return null;
    }
    const updatedCounter = await Counter.findByIdAndUpdate(
      { _id: seqName },
      {
        seq: counter.seq + 1,
      },
      {
        new: true,
      }
    );

    // console.log(counter);
    return counter.seq;
  } catch (error) {
    console.log('counter:\n', error);
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
  const year = new Date().getFullYear();
  const id =
    'NITM' +
    year.toString().substr(2, 2) +
    modelName.toUpperCase().substr(0, 3) +
    (1000 + seq).toString();
  // console.log('Hrg:', id);
  return id;
};
