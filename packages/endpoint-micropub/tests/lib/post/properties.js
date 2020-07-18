import test from 'ava';
import dateFns from 'date-fns';
import {getFixture} from '../../helpers/fixture.js';
import {
  getContent,
  getPermalink,
  getPublishedDate,
  getSlug
} from '../../../lib/post/properties.js';

const {isValid, parseISO} = dateFns;

test('Derives content from `content[0].html` property', t => {
  const mf2 = JSON.parse(getFixture('content-provided-html-value.json'));
  const content = getContent(mf2);
  t.is(content[0], '<p>Visit this <a href="https://website.example">example website</a>.</p>');
});

test('Derives content from `content[0].html` property (ignores `content.value`)', t => {
  const mf2 = JSON.parse(getFixture('content-provided-html.json'));
  const content = getContent(mf2);
  t.is(content[0], '<p>Visit this <a href="https://website.example">example website</a>.</p>');
});

test('Derives content from `content[0].value` property', t => {
  const mf2 = JSON.parse(getFixture('content-provided-value.json'));
  const content = getContent(mf2);
  t.is(content[0], 'Visit this example website.');
});

test('Derives content from `content[0]` property', t => {
  const mf2 = JSON.parse(getFixture('content-provided.json'));
  const content = getContent(mf2);
  t.is(content[0], 'Visit this example website.');
});

test('Derives a permalink', t => {
  t.is(getPermalink('http://foo.bar', 'baz'), 'http://foo.bar/baz');
  t.is(getPermalink('http://foo.bar/', '/baz'), 'http://foo.bar/baz');
  t.is(getPermalink('http://foo.bar/baz', '/qux/quux'), 'http://foo.bar/baz/qux/quux');
  t.is(getPermalink('http://foo.bar/baz/', '/qux/quux'), 'http://foo.bar/baz/qux/quux');
});

test('Derives date from `published` property', t => {
  const mf2 = JSON.parse(getFixture('published-provided.json'));
  const published = getPublishedDate(mf2);
  t.is(published[0], '2019-01-02T03:04:05Z');
});

test('Derives date from `published` property with short date', t => {
  const mf2 = JSON.parse(getFixture('published-provided-short-date.json'));
  const published = getPublishedDate(mf2);
  t.is(published[0], '2019-01-02T00:00:00Z');
});

test('Derives date by using current date', t => {
  const mf2 = JSON.parse(getFixture('published-missing.json'));
  const published = getPublishedDate(mf2);
  t.true(isValid(parseISO(published[0])));
});

test('Derives slug from `slug` property', t => {
  const mf2 = JSON.parse(getFixture('slug-provided.json'));
  const slug = getSlug(mf2, '-');
  t.is(slug[0], 'cheese-sandwich');
});

test('Derives slug from `mp-slug` property', t => {
  const mf2 = JSON.parse(getFixture('mp-slug-provided.json'));
  const slug = getSlug(mf2, '-');
  t.is(slug[0], 'cheese-sandwich');
});

test('Derives slug, ignoring empty `slug` property', t => {
  const mf2 = JSON.parse(getFixture('slug-provided-empty.json'));
  const slug = getSlug(mf2, '-');
  t.is(slug[0], 'i-ate-a-cheese-sandwich');
});

test('Derives slug, ignoring empty `mp-slug` property', t => {
  const mf2 = JSON.parse(getFixture('mp-slug-provided-empty.json'));
  const slug = getSlug(mf2, '-');
  t.is(slug[0], 'i-ate-a-cheese-sandwich');
});

test('Derives slug from `name` property', t => {
  const mf2 = JSON.parse(getFixture('slug-missing.json'));
  const slug = getSlug(mf2, '-');
  t.is(slug[0], 'i-ate-a-cheese-sandwich');
});

test('Derives slug by generating random number', t => {
  const mf2 = JSON.parse(getFixture('slug-missing-no-name.json'));
  const slug = getSlug(mf2, '-');
  t.regex(slug[0], /[\d\w]{5}/g);
});
