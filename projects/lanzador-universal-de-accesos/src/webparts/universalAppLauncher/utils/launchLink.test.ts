import { parseAudienceTokens, resolveLinkProps } from './launchLink';

describe('launchLink', () => {
  it('parses audience tokens from mixed separators', () => {
    expect(parseAudienceTokens('hr, people; general\nall')).toEqual(['hr', 'people', 'general', 'all']);
  });

  it('forces safe external links when requested', () => {
    expect(resolveLinkProps('/sites/hr', true)).toEqual({
      href: '/sites/hr',
      rel: 'noopener noreferrer',
      target: '_blank'
    });
  });

  it('drops dangerous protocols from safe links', () => {
    expect(resolveLinkProps('data:text/html,boom', true)).toBeUndefined();
  });
});
