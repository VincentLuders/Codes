Sub FormatCandidateDetails()
    Dim doc As Document
    Dim para As Paragraph
    Dim rng As Range
    Dim found As Boolean
    Dim colonPos As Integer

    Set doc = ActiveDocument

    ' Underline and bold the first line
    Set rng = doc.Paragraphs(1).Range
    rng.Font.Underline = wdUnderlineSingle
    rng.Font.Bold = True
    
    ' Bold the first line up to the colon
    Set rng = doc.Paragraphs(1).Range
    found = rng.Find.Execute(FindText:=":")
    If found Then
        rng.End = rng.End - 1
        rng.Font.Bold = True
    End If

    ' Bold everything up to the colon
    For Each para In doc.Paragraphs
        If InStr(para.Range.Text, ":") > 0 Then
            Set rng = para.Range
            colonPos = InStr(rng.Text, ":")
            rng.End = rng.Start + colonPos - 1
            rng.Font.Bold = True
        End If
    Next para
    
    ' Underline and bold "Technical Skills:"
    found = doc.Content.Find.Execute(FindText:="Technical Skills:")
    If found Then
        Set rng = doc.Content
        rng.Find.Execute FindText:="Technical Skills:"
        rng.Font.Bold = True
        rng.Font.Underline = wdUnderlineSingle
    End If
    
    ' Bold specific keywords
    Dim keywords As Variant
    keywords = Array("Fluent:", "Native:", "Master's degree", "Master", "Bachelor's degree", "Bachelor", "Bac+3", "PHD", "Diploma", "Bac+5", "BTS")
    
    For Each keyword In keywords
        found = doc.Content.Find.Execute(FindText:=keyword)
        If found Then
            Set rng = doc.Content
            rng.Find.Execute FindText:=keyword
            rng.Font.Bold = True
        End If
    Next keyword
End Sub
