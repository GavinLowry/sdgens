
export function roll(lo: number, hi: number): number {
	const span = hi - lo + 1;
	return Math.floor(Math.random() * span) + lo;
}

export function chooseRandom(options: string[]): string {
	return options[roll(0,options.length-1)];
}

export function generateName() {
	const nameParts = {
		start: ['Bar','Bra','Brae','Brig','Bro','Den','Eg','El','Eu','Gant','Gin','He','Jor','Ka','Ol','Or','Pike','Ri','Sar','Tor','Tro','Yor','Zor'],
		middle: ['ge','phy','seb','tri'],
		end: ['da','dia','dor','g','ga','gin','go','grid','ias','in','ius','li','na','ny','ra','rim','sa','ton'],
	};
	const surnameParts = {
		start: ['Ash','Ba','Ben','Big','Brick','Broo','Brow','Car','Chee','Clar','Coo','Flet','Fore','Ghi','Gre','Hugh','Mann','Nash','Pay','Rol','Tay','Wal','Ward','Webb','Wood'],
		middle: ['bur','en','er','go','lar','pen','se'],
		end: ['cher','den','di','down','es','fe','frey','ge','ger','ing','ke','ker','lor','man','ne','nett','per','ry','ter','ton'],
	};

	const nameStart = chooseRandom(nameParts.start);
	const nameMid = roll(1,4) === 1 ? chooseRandom(nameParts.middle) : '';
	const nameEnd = chooseRandom(nameParts.end);
	const name = `${nameStart}${nameMid}${nameEnd}`;
	const surnameStart = chooseRandom(surnameParts.start);
	const surnameMid = roll(1,3) === 1 ? chooseRandom(surnameParts.middle) : '';
	const surnameEnd = chooseRandom(surnameParts.end)
	const surname = `${surnameStart}${surnameMid}${surnameEnd}`;
	return `${name} ${surname}`;
}


