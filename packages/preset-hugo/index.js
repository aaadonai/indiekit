import TOML from '@iarna/toml';
import YAML from 'yaml';
import {
  getPostTypeConfig
} from '../endpoint-micropub/lib/utils.js';

const defaults = {
  frontmatterFormat: 'toml'
};

const getFrontmatter = (properties, frontmatterFormat) => {
  let delimiters;
  let frontmatter;
  switch (frontmatterFormat) {
    case 'json':
      delimiters = ['', '\n'];
      frontmatter = JSON.stringify(properties, null, 2);
      break;
    case 'toml':
      delimiters = ['+++\n', '+++\n'];
      frontmatter = TOML.stringify(properties);
      break;
    case 'yaml':
    default:
      delimiters = ['---\n', '---\n'];
      frontmatter = YAML.stringify(properties);
      break;
  }

  return `${delimiters[0]}${frontmatter}${delimiters[1]}`;
};

export const HugoPreset = class {
  constructor(options = {}) {
    this.id = 'hugo';
    this.name = 'Hugo';
    this.options = {...defaults, ...options};
  }

  /**
   * Post types
   *
   * @returns {object} Post types config
   */
  get postTypes() {
    return [{
      type: 'article',
      name: 'Article',
      post: {
        path: 'content/articles/{slug}.md',
        url: 'articles/{slug}'
      },
      media: {
        path: 'static/articles/{filename}',
        url: 'articles/{filename}'
      }
    }, {
      type: 'note',
      name: 'Note',
      post: {
        path: 'content/notes/{yyyy}-{MM}-{dd}-{slug}.md',
        url: 'notes/{yyyy}/{MM}/{dd}/{slug}'
      }
    }, {
      type: 'photo',
      name: 'Photo',
      post: {
        path: 'content/photos/{slug}.md',
        url: 'photos/{slug}'
      },
      media: {
        path: 'static/photos/{filename}',
        url: 'photos/{filename}'
      }
    }, {
      type: 'video',
      name: 'Video',
      post: {
        path: 'content/videos/{slug}.md',
        url: 'videos/{slug}'
      },
      media: {
        path: 'static/videos/{filename}',
        url: 'videos/{filename}'
      }
    }, {
      type: 'audio',
      name: 'Audio',
      post: {
        path: 'content/audio/{slug}.md',
        url: 'audio/{slug}'
      },
      media: {
        path: 'static/audio/{filename}',
        url: 'audio/{filename}'
      }
    }, {
      type: 'bookmark',
      name: 'Bookmark',
      post: {
        path: 'content/bookmarks/{yyyy}-{MM}-{dd}-{slug}.md',
        url: 'bookmarks/{yyyy}/{MM}/{dd}/{slug}'
      }
    }, {
      type: 'checkin',
      name: 'Checkin',
      post: {
        path: 'content/checkins/{slug}.md',
        url: 'checkins/{slug}'
      }
    }, {
      type: 'event',
      name: 'Event',
      post: {
        path: 'content/events/{slug}.md',
        url: 'events/{slug}'
      }
    }, {
      type: 'rsvp',
      name: 'Reply with RSVP',
      post: {
        path: 'content/replies/{yyyy}-{MM}-{dd}-{slug}.md',
        url: 'replies/{yyyy}/{MM}/{dd}/{slug}'
      }
    }, {
      type: 'reply',
      name: 'Reply',
      post: {
        path: 'content/replies/{yyyy}-{MM}-{dd}-{slug}.md',
        url: 'replies/{yyyy}/{MM}/{dd}/{slug}'
      }
    }, {
      type: 'repost',
      name: 'Repost',
      post: {
        path: 'content/reposts/{slug}.md',
        url: 'reposts/{slug}'
      }
    }, {
      type: 'like',
      name: 'Like',
      post: {
        path: 'content/likes/{yyyy}-{MM}-{dd}-{slug}.md',
        url: 'likes/{yyyy}/{MM}/{dd}/{slug}'
      }
    }];
  }

  /**
   * Post template
   *
   * @param {object} properties Post data variables
   * @returns {string} Rendered template
   */
  postTemplate(properties) {
    let content;
    if (properties.content) {
      content = properties.content.html || properties.content;
      content = `${content}\n`;
      if (properties['in-reply-to']) {
        content = '[in reply](' + properties['in-reply-to'] + ') ' + content
      }
      if (properties['bookmark-of']) {
        content = '[bookmark](' + properties['bookmark-of'] + ') ' + content
      }
      if (properties['post-type'] == 'note') {
        properties.name = content.substring(0, 10) + '...';
        property.url = getPostTypeConfig(properties['post-type'], getPostTypes());
      }
    } else {
      content = '';
    }

    properties = {
      date: properties.published,
      ...(properties.name && {title: properties.name}),
      ...(properties.url && {url: properties.url}),
      ...(properties.summary && {summary: properties.summary}),
      ...(properties.category && {category: properties.category}),
      ...(properties.start && {start: properties.start}),
      ...(properties.end && {end: properties.end}),
      ...(properties.rsvp && {rsvp: properties.rsvp}),
      ...(properties.location && {location: properties.location}),
      ...(properties.checkin && {checkin: properties.checkin}),
      ...(properties.audio && {audio: properties.audio}),
      ...(properties.photo && {images: properties.photo}),
      ...(properties.video && {videos: properties.video}),
      ...(properties['bookmark-of'] && {'bookmark-of': properties['bookmark-of']}),
      ...(properties['like-of'] && {'bookmark-of': properties['like-of']}),
      ...(properties['repost-of'] && {'repost-of': properties['repost-of']}),
      ...(properties['in-reply-to'] && {'in-reply-to': properties['in-reply-to']}),
      ...(properties['syndicate-to'] && {'syndicate-to': properties['syndicate-to']}),
      ...(properties['post-status'] === 'draft' && {draft: true}),
      ...(properties.visibility && {visibility: properties.visibility})
    };

    // const frontmatter = getFrontmatter(properties, this.options.frontmatterFormat);
    const frontmatter = getFrontmatter(properties, defaults);

    return frontmatter + content;
  }
};
