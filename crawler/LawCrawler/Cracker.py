import execjs
import ddddocr

class Cracker():
    def __init__(self, x, i, d, g):
        self.js_code = "var x = '" + x + "'," + "g = '" + g + "'," + "i = '" + i + "'," + "d = '" + d + "';"
        self.js_code = self.js_code + '''
                            function D() {
                                var O = {
                                    'hostname': 'flk.npc.gov.cn',
                                    'scheme': 'https'
                                };
                                if (!d.startsWith('WZWS_')) {
                                    O['verify'] = d;
                                }
                                return U(JSON.stringify(O));
                            }

                            function E() {
                                O = 0;
                                for (B = 0; B < x.length; B++) {
                                    O += x.charCodeAt(B);
                                }
                                O *= i;
                                return O += 111111, 'WZWS_CONFIRM_PREFIX_LABEL' + O;
                            }

                            function U(W) {
                                B = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                                var z = '';
                                for (var f = 0; f < W['length'];) {
                                    var S = (W.charCodeAt(f++)) & 255;
                                    if(f === W['length']) {
                                        z += B.charAt(S >> 2);
                                        z += B.charAt(((S & 3) << 4));
                                        z += '==';
                                        break;
                                    }
                                    var a = W.charCodeAt(f++);
                                    if(f === W['length']) {
                                        z += B.charAt(S >> 2);
                                        z += B.charAt(((S & 3) << 4) | ((a & 240) >> 4));
                                        z += B.charAt(((a & 15) << 2) | ((u & 192) >> 6));
                                        z += '=';
                                        break;
                                    }
                                    var u = W.charCodeAt(f++);
                                    z += B.charAt(S >> 2),
                                        z += B.charAt(((S & 3) << 4) | ((a & 240) >> 4)),
                                        z += B.charAt(((a & 15) << 2) | ((u & 192) >> 6)),
                                        z += B.charAt(u & 63);
                                }
                                return z;
                            }

                            function result() {
                            var u = U(E()),
                                n = D(),
                                y = g + '?wzwschallenge=' + u + '&wzwsinfos=' + n;
                                return y;
                            }
                            '''
    def getUrl(self) -> str:
        ctx = execjs.compile(self.js_code)
        result = ctx.call('result')
        return result
    
class OCR():
    def __init__(self) -> None:
        pass

    @staticmethod
    def OCR(path):
        ocr = ddddocr.DdddOcr()
        with open(path, 'rb') as f:
            img_bytes = f.read()
        res = ocr.classification(img_bytes)
        return res

    
if __name__ == "__main__":
    text = OCR.OCR('./data/1.jpg')
    print(text)