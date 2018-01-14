import 'chai';
import 'chai-as-promised';
import 'sinon-chai';

declare module 'sinon' {

    interface SinonSpyStatic {
        <T extends Function>(func: T): SinonSpy & T;
    }
}
