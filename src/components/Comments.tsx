import React from 'react';
import { useUtterances } from '../hooks/useUtterances';

const commentNodeId = 'comments';

interface CommentsProps {
  slug: string;
}

const Comments = ({ slug }: CommentsProps) => {
	useUtterances(slug);
	return <div id={slug} />;
};

export default Comments;