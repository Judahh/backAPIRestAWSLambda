const requestAllow = async (req, res) => {
  const { method } = req;
  res['method'] = method + 'Allow';
};

export default requestAllow;
