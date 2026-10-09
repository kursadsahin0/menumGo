export const termsVersion = '2026-10-09'

export function acceptedCurrentTerms(body) {
  return body?.acceptedTerms === true && body?.termsVersion === termsVersion
}
