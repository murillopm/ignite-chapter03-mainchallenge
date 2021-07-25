import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post() {
  const router = useRouter()

  
  return (
    router.isFallback ? (
      <p>Carregando...</p>
    ) : (
      <>
        {/* <img src={} alt="" /> */}
        <div className={commonStyles.page}>
          <p>Texto</p>
        </div>
      </>
    )
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post')
  );

  const slugs = posts.results.map(post => {
    return {
      params: { slug: post.uid}
    }
  })
  
  return {
    paths: slugs.slice(1),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  //console.log(response.data.content)
  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: {
        url: response.data.banner
      },
      title: response.data.title,
      content: response.data.content,
    }
  }

  console.log(RichText.asHtml(post.data.content[0].body))

  return {
    props: {},
    //revalidate: 60
  }
};
