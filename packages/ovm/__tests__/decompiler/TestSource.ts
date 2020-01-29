export const testSource = `@library
@quantifier("range,NUMBER,\${zero}-\${upper_bound}")
def LessThan(n, upper_bound) :=
  IsLessThan(n, upper_bound)
    
def test(a) := LessThan(a).all(b -> Bool(b) and Bool(b))
`
