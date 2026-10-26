// Where a source lives, in words a reader knows: "Rolling Stone", not
// "rollingstone.com". The ticket under a citation (components/ui/SourceLink)
// shows it, so a reader sees which publication they're about to open before
// they open it. A page read from the Internet Archive is named after the
// site it was archived from, marked as an archived copy. Any site not named
// here shows as its own address, which is honest if plainer.

const OUTLETS: Record<string, string> = {
  'arthurmag.com': 'Arthur',
  'avclub.com': 'The A.V. Club',
  'beat.com.au': 'Beat',
  'billboard.com': 'Billboard',
  'blog.calarts.edu': 'CalArts',
  'chipmidnight.com': 'Chip Midnight',
  'citybeat.com': 'CityBeat',
  'clashmusic.com': 'Clash',
  'cocteautwins.com': 'Cocteau Twins',
  'consequence.net': 'Consequence',
  'creemarchive.creem.com': 'CREEM',
  'dazeddigital.com': 'Dazed',
  'drownedinsound.com': 'Drowned in Sound',
  'electronicbeats.net': 'Electronic Beats',
  'electronicsound.co.uk': 'Electronic Sound',
  'en.wikipedia.org': 'Wikipedia',
  'encyclopedia.com': 'Encyclopedia.com',
  'epigram.org.uk': 'Epigram',
  'exclaim.ca': 'Exclaim!',
  'faroutmagazine.co.uk': 'Far Out',
  'flavorwire.com': 'Flavorwire',
  'floodmagazine.com': 'FLOOD',
  'genius.com': 'Genius',
  'grammy.com': 'GRAMMY.com',
  'guitar.com': 'Guitar.com',
  'guitarguitar.co.uk': 'guitarguitar',
  'guitarplayer.com': 'Guitar Player',
  'indexmagazine.com': 'Index Magazine',
  'insheepsclothinghifi.com': "In Sheep's Clothing",
  'jagjaguwar.com': 'Jagjaguwar',
  'juicemagazine.com': 'Juice',
  'kut.org': 'KUT',
  'lasvegassun.com': 'Las Vegas Sun',
  'lifeoftherecord.com': 'Life of the Record',
  'list.co.uk': 'The List',
  'loudandquiet.com': 'Loud And Quiet',
  'louder.com': 'Louder',
  'loudersound.com': 'Louder',
  'macleans.ca': "Maclean's",
  'maximumfun.org': 'Maximum Fun',
  'mixdownmag.com.au': 'Mixdown',
  'musicradar.com': 'MusicRadar',
  'myspace.com': 'Myspace',
  'nme.com': 'NME',
  'npr.org': 'NPR',
  'nylon.com': 'NYLON',
  'pbs.org': 'PBS',
  'perfectsoundforever.com': 'Perfect Sound Forever',
  'phillyvoice.com': 'PhillyVoice',
  'pitchfork.com': 'Pitchfork',
  'popmatters.com': 'PopMatters',
  'post-rock.lv': 'post-rock.lv',
  'premierguitar.com': 'Premier Guitar',
  'quoteinvestigator.com': 'Quote Investigator',
  'rateyourmusic.com': 'Rate Your Music',
  'redbullmusicacademy.com': 'Red Bull Music Academy',
  'daily.redbullmusicacademy.com': 'Red Bull Music Academy',
  'rollingstone.com': 'Rolling Stone',
  'rollingstoneindia.com': 'Rolling Stone India',
  'russh.com': 'RUSSH',
  'sandiegoreader.com': 'San Diego Reader',
  'scaruffi.com': 'Piero Scaruffi',
  'slugmag.com': 'SLUG Magazine',
  'spin.com': 'SPIN',
  'spinmagazine.com': 'SPIN',
  'staythirstymedia.com': 'Stay Thirsty',
  'stereogum.com': 'Stereogum',
  'stilllisteningmagazine.com': 'Still Listening',
  'stopsmilingonline.com': 'Stop Smiling',
  'sun-13.com': 'Sun 13',
  'tapeop.com': 'Tape Op',
  'thecurrent.org': 'The Current',
  'theboar.org': 'The Boar',
  'thefader.com': 'The FADER',
  'theguardian.com': 'The Guardian',
  'thelineofbestfit.com': 'The Line of Best Fit',
  'thepinknews.com': 'PinkNews',
  'thequietus.com': 'The Quietus',
  'theredhandfiles.com': 'The Red Hand Files',
  'thetimes.com': 'The Times',
  'thetimes.co.uk': 'The Times',
  'tidal.com': 'TIDAL',
  'trouserpress.com': 'Trouser Press',
  'uncut.co.uk': 'Uncut',
  'undertheradarmag.com': 'Under the Radar',
  'uproxx.com': 'Uproxx',
  'vice.com': 'Vice',
  'westword.com': 'Westword',
  'wfuv.org': 'WFUV',
  'wmagazine.com': 'W Magazine',
  'wrsu.org': 'WRSU',
  'younggodrecords.com': 'Young God Records',
};

export interface SourcePlace {
  /** The publication's name, or the site's address when it isn't named. */
  name: string;
  /** Read from the Internet Archive's copy of that site's page. */
  archived: boolean;
}

export function sourcePlace(url: string): SourcePlace {
  let target = url;
  const archived = /^https?:\/\/web\.archive\.org\/web\/[^/]+\//.test(url);
  if (archived) target = url.replace(/^https?:\/\/web\.archive\.org\/web\/[^/]+\//, '').replace(/^(?!https?:\/\/)/, 'http://');
  let host: string;
  try {
    host = new URL(target).hostname.toLowerCase();
  } catch {
    return { name: url, archived };
  }
  host = host.replace(/^(www|m|au|amp)\./, '');
  return { name: OUTLETS[host] ?? host, archived };
}
