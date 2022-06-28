import { NextApiRequest, NextApiResponse } from 'next';

const requestAllow = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  res['method'] = method + 'Allow';
};

export default requestAllow;
