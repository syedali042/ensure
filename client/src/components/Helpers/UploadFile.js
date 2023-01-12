import axios from 'axios';

const UploadFile = async (obj) => {
  try {
    const data = new FormData();

    data.set('file', obj.file);

    const updateRes = await axios.post(`api/files/upload`, data, {
      headers: {
        Authorization: 'Bearer ' + obj.authToken,
      },
    });

    return updateRes.data;
  } catch (err) {
    throw err;
  }
};

export default UploadFile;
